import { Request, Response } from 'express';
import { execute, query, queryOne, saveDatabase } from '../db/database.js';
import { calculatePlanPricing } from './plansController.js';
import { PlanRecord, ApplicationSubmissionPayload } from '../types/index.js';

function generateApplicationId(sequenceNum: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNum).padStart(6, '0');
  return `DTN-${year}-${padded}`;
}

export async function submitApplication(req: Request, res: Response): Promise<void> {
  try {
    const payload: ApplicationSubmissionPayload = req.body;

    // 1. Validation
    if (!payload.applicantName || payload.applicantName.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Applicant name is required.' });
      return;
    }

    if (!payload.category) {
      res.status(400).json({ success: false, message: 'Applicant category is required.' });
      return;
    }

    if (payload.category === 'Residential' && !payload.occupancyStatus) {
      res.status(400).json({ success: false, message: 'Occupancy status (Owner or Tenant) is required for Residential category.' });
      return;
    }

    const orgCategories = ['SME', 'Corporate', 'Wholesale', 'NGO', 'Educational Institution', 'Government'];
    if (orgCategories.includes(payload.category) && (!payload.orgName || payload.orgName.trim().length === 0)) {
      res.status(400).json({ success: false, message: 'Organization name is required for organizational applicants.' });
      return;
    }

    // Validate phone: 10-digit Indian mobile
    const cleanPhone = (payload.contactNumber || '').replace(/[^0-9]/g, '');
    const phoneValid = /^[6-9]\d{9}$/.test(cleanPhone.slice(-10));
    if (!phoneValid) {
      res.status(400).json({ success: false, message: 'A valid 10-digit Indian mobile number is required.' });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.contactEmail || !emailRegex.test(payload.contactEmail)) {
      res.status(400).json({ success: false, message: 'A valid contact email address is required.' });
      return;
    }

    // Validate connection address
    const connAddr = payload.connectionAddress;
    if (!connAddr || !connAddr.line1 || !connAddr.area || !connAddr.city || !connAddr.state || !connAddr.pincode) {
      res.status(400).json({ success: false, message: 'Complete connection address details (Line 1, Area, City, State, PIN) are required.' });
      return;
    }

    // Validate PIN code (6-digit Indian PIN)
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(connAddr.pincode.trim())) {
      res.status(400).json({ success: false, message: 'A valid 6-digit Indian PIN code is required for the connection address.' });
      return;
    }

    // Permanent address
    const permAddr = payload.sameAsConnectionAddress ? payload.connectionAddress : payload.permanentAddress;
    if (!permAddr || !permAddr.line1 || !permAddr.area || !permAddr.city || !permAddr.state || !permAddr.pincode) {
      res.status(400).json({ success: false, message: 'Complete permanent address details are required.' });
      return;
    }

    // Declaration acceptance
    if (!payload.declarationAccepted) {
      res.status(400).json({ success: false, message: 'You must review and accept the DTN India broadband service declaration.' });
      return;
    }

    // Plan validation
    if (!payload.planId) {
      res.status(400).json({ success: false, message: 'Please select an internet plan.' });
      return;
    }

    const plan = await queryOne<PlanRecord>('SELECT * FROM plans WHERE id = ? AND is_active = 1', [payload.planId]);
    if (!plan) {
      res.status(400).json({ success: false, message: 'Selected internet plan is invalid or no longer active.' });
      return;
    }

    const billingFrequency = payload.billingFrequency || 'Monthly';
    const pricing = calculatePlanPricing(plan, billingFrequency);

    // Generate unique sequential application ID
    const countRow = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM applications');
    let nextSeq = (countRow?.count || 0) + 1;
    let appIdStr = generateApplicationId(nextSeq);

    // Double check uniqueness
    let exists = await queryOne('SELECT id FROM applications WHERE application_id = ?', [appIdStr]);
    while (exists) {
      nextSeq += 1;
      appIdStr = generateApplicationId(nextSeq);
      exists = await queryOne('SELECT id FROM applications WHERE application_id = ?', [appIdStr]);
    }

    const now = new Date().toISOString();

    // 2. Insert application
    const appRes = await execute(`
      INSERT INTO applications (
        application_id, category, occupancy_status, applicant_title, applicant_name,
        org_name, org_representative, org_designation,
        dob, gender, existing_customer, consumer_number,
        contact_number, contact_email, declaration_accepted,
        declaration_terms_version, declaration_timestamp, status, payment_status,
        notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 1,
        'v1.0-demo', ?, 'Submitted', 'Not Initiated',
        ?, ?, ?
      )
    `, [
      appIdStr,
      payload.category,
      payload.occupancyStatus || null,
      payload.applicantTitle || 'Mr.',
      payload.applicantName.trim(),
      payload.orgName ? payload.orgName.trim() : null,
      payload.orgRepresentative ? payload.orgRepresentative.trim() : null,
      payload.orgDesignation ? payload.orgDesignation.trim() : null,
      payload.dob || null,
      payload.gender || null,
      payload.existingCustomer ? 1 : 0,
      payload.existingCustomer ? (payload.consumerNumber || null) : null,
      cleanPhone.slice(-10),
      payload.contactEmail.trim().toLowerCase(),
      now,
      payload.notes || 'Submitted via customer portal',
      now,
      now
    ]);

    const applicationId = appRes.lastInsertRowId;

    // 3. Insert connection address
    await execute(`
      INSERT INTO addresses (application_id, address_type, line1, line2, area, city, state, pincode)
      VALUES (?, 'CONNECTION', ?, ?, ?, ?, ?, ?)
    `, [
      applicationId,
      connAddr.line1.trim(),
      connAddr.line2 ? connAddr.line2.trim() : null,
      connAddr.area.trim(),
      connAddr.city.trim(),
      connAddr.state.trim(),
      connAddr.pincode.trim()
    ]);

    // 4. Insert permanent address
    await execute(`
      INSERT INTO addresses (application_id, address_type, line1, line2, area, city, state, pincode)
      VALUES (?, 'PERMANENT', ?, ?, ?, ?, ?, ?)
    `, [
      applicationId,
      permAddr.line1.trim(),
      permAddr.line2 ? permAddr.line2.trim() : null,
      permAddr.area.trim(),
      permAddr.city.trim(),
      permAddr.state.trim(),
      permAddr.pincode.trim()
    ]);

    // 5. Insert pricing snapshot
    await execute(`
      INSERT INTO application_pricing_snapshots (
        application_id, plan_id, plan_name, speed_mbps, data_allowance,
        billing_frequency, base_price_paisa, tax_paisa, installation_paisa,
        total_paisa, currency, snapshot_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?)
    `, [
      applicationId,
      plan.id,
      plan.name,
      plan.speed_mbps,
      plan.data_allowance,
      billingFrequency,
      pricing.basePricePaisa,
      pricing.taxPaisa,
      pricing.installationPaisa,
      pricing.totalPaisa,
      now
    ]);

    // 6. Link uploaded documents
    if (payload.uploadedDocumentIds && Array.isArray(payload.uploadedDocumentIds)) {
      for (const docId of payload.uploadedDocumentIds) {
        await execute('UPDATE documents SET application_id = ? WHERE id = ?', [applicationId, docId]);
      }
    }

    // 7. Initialize payment record
    const orderId = `ORD_${appIdStr.replace(/[^A-Za-z0-9]/g, '')}_${Date.now()}`;
    await execute(`
      INSERT INTO payments (
        application_id, order_id, gateway, amount_paisa, currency, status, created_at, updated_at
      ) VALUES (?, ?, 'simulated', ?, 'INR', 'Pending', ?, ?)
    `, [
      applicationId,
      orderId,
      pricing.totalPaisa,
      now,
      now
    ]);

    // 8. Log initial status audit
    await execute(`
      INSERT INTO application_status_history (
        application_id, previous_status, new_status, changed_by, notes, created_at
      ) VALUES (?, 'None', 'Submitted', 'Customer Portal', 'Initial application submitted online', ?)
    `, [applicationId, now]);

    saveDatabase();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: {
        id: applicationId,
        applicationId: appIdStr,
        applicantName: payload.applicantName.trim(),
        category: payload.category,
        status: 'Submitted',
        paymentStatus: 'Pending',
        plan: {
          name: plan.name,
          speedMbps: plan.speed_mbps,
          billingFrequency
        },
        pricing,
        orderId,
        createdAt: now
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process application submission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getApplicationPublicDetails(req: Request, res: Response): Promise<void> {
  try {
    const rawIdentifier = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!rawIdentifier) { res.status(400).json({ success: false, message: 'Missing application identifier' }); return; }
    const identifier: string = rawIdentifier; // narrowed to string

    // Security check: disallow sequential integer enumeration unless admin authorization header is supplied
    const authHeader = req.headers.authorization;
    const isAdmin = Boolean(authHeader && authHeader.startsWith('Bearer '));

    let app: any = null;
    if (/^\d+$/.test(identifier)) {
      if (!isAdmin) {
        res.status(400).json({
          success: false,
          message: 'Please search using your official Application ID (e.g. DTN-2026-000101). Numeric sequential lookup is restricted.'
        });
        return;
      }
      app = await queryOne('SELECT * FROM applications WHERE id = ?', [parseInt(identifier, 10)]);
    } else {
      app = await queryOne('SELECT * FROM applications WHERE application_id = ?', [identifier]);
    }

    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    // Mask sensitive contact details for public lookup if caller is not an administrator
    let maskedContactNumber = app.contact_number;
    let maskedContactEmail = app.contact_email;
    if (!isAdmin) {
      if (app.contact_number && app.contact_number.length >= 6) {
        maskedContactNumber = `${app.contact_number.slice(0, 2)}******${app.contact_number.slice(-2)}`;
      }
      if (app.contact_email && app.contact_email.includes('@')) {
        const [user, domain] = app.contact_email.split('@');
        maskedContactEmail = `${user.slice(0, 1)}***@${domain}`;
      }
    }

    // Fetch addresses
    const addresses = await query('SELECT * FROM addresses WHERE application_id = ?', [app.id]);
    const connectionAddr = addresses.find((a: any) => a.address_type === 'CONNECTION') || null;
    const permanentAddr = addresses.find((a: any) => a.address_type === 'PERMANENT') || null;

    // Fetch pricing snapshot
    const pricing = await queryOne('SELECT * FROM application_pricing_snapshots WHERE application_id = ?', [app.id]);

    // Fetch payment record
    const payment = await queryOne('SELECT * FROM payments WHERE application_id = ? ORDER BY id DESC LIMIT 1', [app.id]);

    // Fetch document metadata (without full storage path for security)
    const documents = await query(`
      SELECT id, document_type, doc_label, original_filename, file_size, mime_type, uploaded_at
      FROM documents WHERE application_id = ?
    `, [app.id]);

    res.json({
      success: true,
      data: {
        id: app.id,
        applicationId: app.application_id,
        category: app.category,
        occupancyStatus: app.occupancy_status,
        applicantTitle: app.applicant_title,
        applicantName: app.applicant_name,
        orgName: app.org_name,
        orgRepresentative: app.org_representative,
        orgDesignation: app.org_designation,
        dob: app.dob,
        gender: app.gender,
        existingCustomer: Boolean(app.existing_customer),
        consumerNumber: app.consumer_number,
        contactNumber: maskedContactNumber,
        contactEmail: maskedContactEmail,
        status: app.status,
        paymentStatus: app.payment_status,
        createdAt: app.created_at,
        connectionAddress: connectionAddr,
        permanentAddress: permanentAddr,
        pricing: pricing ? {
          planId: pricing.plan_id,
          planName: pricing.plan_name,
          speedMbps: pricing.speed_mbps,
          dataAllowance: pricing.data_allowance,
          billingFrequency: pricing.billing_frequency,
          basePriceRupees: pricing.base_price_paisa / 100,
          taxRupees: pricing.tax_paisa / 100,
          installationRupees: pricing.installation_paisa / 100,
          totalRupees: pricing.total_paisa / 100,
          currency: pricing.currency
        } : null,
        payment: payment ? {
          orderId: payment.order_id,
          status: payment.status,
          amountRupees: payment.amount_paisa / 100,
          paymentMethod: payment.payment_method,
          paymentId: payment.payment_id
        } : null,
        documents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
