import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest, generateToken } from '../middleware/auth.js';
import { execute, query, queryOne, saveDatabase } from '../db/database.js';
import { generateApplicationsWorkbook } from '../services/excelService.js';

export async function adminLogin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required' });
      return;
    }

    const admin = await queryOne('SELECT * FROM admins WHERE username = ? OR email = ?', [username.trim(), username.trim().toLowerCase()]);
    if (!admin) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, admin.password_hash);
    if (!validPassword) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
      return;
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getAdminProfile(req: AuthRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    admin: req.admin
  });
}

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const totalApps = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM applications'))?.count || 0;
    const submittedApps = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE status = 'Submitted'"))?.count || 0;
    const underReviewApps = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE status = 'Under Review'"))?.count || 0;
    const approvedApps = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE status = 'Approved'"))?.count || 0;
    const rejectedApps = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE status = 'Rejected'"))?.count || 0;

    const paidPayments = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE payment_status = 'Paid'"))?.count || 0;
    const pendingPayments = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE payment_status = 'Pending'"))?.count || 0;
    const failedPayments = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM applications WHERE payment_status IN ('Failed', 'Cancelled')"))?.count || 0;

    res.json({
      success: true,
      data: {
        total: totalApps,
        submitted: submittedApps,
        underReview: underReviewApps,
        approved: approvedApps,
        rejected: rejectedApps,
        paid: paidPayments,
        pending: pendingPayments,
        failed: failedPayments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function buildFilterQuery(filters: any) {
  const conditions: string[] = ['1=1'];
  const params: any[] = [];

  if (filters.search) {
    const searchTerm = `%${filters.search.trim()}%`;
    conditions.push(`(
      a.application_id LIKE ? OR
      a.applicant_name LIKE ? OR
      a.contact_number LIKE ? OR
      a.contact_email LIKE ? OR
      a.org_name LIKE ?
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (filters.category && filters.category !== 'all') {
    conditions.push('a.category = ?');
    params.push(filters.category);
  }

  if (filters.status && filters.status !== 'all') {
    conditions.push('a.status = ?');
    params.push(filters.status);
  }

  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    conditions.push('a.payment_status = ?');
    params.push(filters.paymentStatus);
  }

  if (filters.startDate) {
    conditions.push('a.created_at >= ?');
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push('a.created_at <= ?');
    params.push(`${filters.endDate}T23:59:59.999Z`);
  }

  return { whereClause: conditions.join(' AND '), params };
}

export async function getApplicationsList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '10', 10)));
    const offset = (page - 1) * limit;

    const { whereClause, params } = buildFilterQuery(req.query);

    // Get total matching count
    const countSql = `SELECT COUNT(*) as count FROM applications a WHERE ${whereClause}`;
    const totalRow = await queryOne<{ count: number }>(countSql, params);
    const total = totalRow?.count || 0;

    // Get applications with joined addresses and pricing snapshot
    const listSql = `
      SELECT 
        a.id, a.application_id, a.category, a.occupancy_status, a.applicant_title,
        a.applicant_name, a.org_name, a.org_representative, a.org_designation,
        a.dob, a.gender, a.existing_customer, a.consumer_number,
        a.contact_number, a.contact_email, a.status, a.payment_status,
        a.created_at, a.updated_at,
        c_addr.area as conn_area, c_addr.city as conn_city, c_addr.state as conn_state,
        p_snap.plan_name, p_snap.speed_mbps, p_snap.billing_frequency,
        p_snap.total_paisa
      FROM applications a
      LEFT JOIN addresses c_addr ON c_addr.application_id = a.id AND c_addr.address_type = 'CONNECTION'
      LEFT JOIN application_pricing_snapshots p_snap ON p_snap.application_id = a.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const records = await query(listSql, [...params, limit, offset]);

    const formatted = records.map((r: any) => ({
      id: r.id,
      applicationId: r.application_id,
      category: r.category,
      occupancyStatus: r.occupancy_status,
      applicantTitle: r.applicant_title,
      applicantName: r.applicant_name,
      orgName: r.org_name,
      orgRepresentative: r.org_representative,
      contactNumber: r.contact_number,
      contactEmail: r.contact_email,
      connectionArea: r.conn_area,
      connectionCity: r.conn_city,
      connectionState: r.conn_state,
      planName: r.plan_name || 'N/A',
      speedMbps: r.speed_mbps || 0,
      billingFrequency: r.billing_frequency || 'N/A',
      totalRupees: r.total_paisa ? r.total_paisa / 100 : 0,
      status: r.status,
      paymentStatus: r.payment_status,
      createdAt: r.created_at
    }));

    res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: formatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application list',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getApplicationDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid application ID' }); return; }
    const app = await queryOne('SELECT * FROM applications WHERE id = ?', [id]);

    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const addresses = await query('SELECT * FROM addresses WHERE application_id = ?', [id]);
    const connectionAddress = addresses.find((a: any) => a.address_type === 'CONNECTION') || null;
    const permanentAddress = addresses.find((a: any) => a.address_type === 'PERMANENT') || null;

    const pricing = await queryOne('SELECT * FROM application_pricing_snapshots WHERE application_id = ?', [id]);
    const payments = await query('SELECT * FROM payments WHERE application_id = ? ORDER BY id DESC', [id]);
    const documents = await query('SELECT * FROM documents WHERE application_id = ?', [id]);
    const statusHistory = await query('SELECT * FROM application_status_history WHERE application_id = ? ORDER BY id DESC', [id]);

    res.json({
      success: true,
      data: {
        ...app,
        existingCustomer: Boolean(app.existing_customer),
        declarationAccepted: Boolean(app.declaration_accepted),
        connectionAddress,
        permanentAddress,
        pricing: pricing ? {
          ...pricing,
          basePriceRupees: pricing.base_price_paisa / 100,
          taxRupees: pricing.tax_paisa / 100,
          installationRupees: pricing.installation_paisa / 100,
          totalRupees: pricing.total_paisa / 100
        } : null,
        payments: payments.map((p: any) => ({
          ...p,
          amountRupees: p.amount_paisa / 100
        })),
        documents: documents.map((d: any) => ({
          id: d.id,
          documentType: d.document_type,
          docLabel: d.doc_label,
          originalFilename: d.original_filename,
          mimeType: d.mime_type,
          fileSize: d.file_size,
          uploadedAt: d.uploaded_at
        })),
        statusHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid application ID' }); return; }
    const { status, notes } = req.body;

    const allowed = ['Submitted', 'Under Review', 'Approved', 'Rejected'];
    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status "${status}". Allowed: ${allowed.join(', ')}` });
      return;
    }

    const app = await queryOne('SELECT * FROM applications WHERE id = ?', [id]);
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const previousStatus = app.status;
    const now = new Date().toISOString();
    const changedBy = req.admin?.username || 'Administrator';

    await execute('UPDATE applications SET status = ?, notes = ?, updated_at = ? WHERE id = ?', [
      status,
      notes ? `${app.notes || ''}\n[${now}] ${notes}` : app.notes,
      now,
      id
    ]);

    await execute(`
      INSERT INTO application_status_history (
        application_id, previous_status, new_status, changed_by, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [id, previousStatus, status, changedBy, notes || `Status changed from ${previousStatus} to ${status}`, now]);

    saveDatabase();

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: {
        applicationId: app.application_id,
        previousStatus,
        newStatus: status,
        updatedAt: now
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function exportApplicationsToExcel(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { whereClause, params } = buildFilterQuery(req.query);

    const querySql = `
      SELECT 
        a.*,
        c.line1 as conn_line1, c.line2 as conn_line2, c.area as conn_area, c.city as conn_city, c.state as conn_state, c.pincode as conn_pincode,
        p.line1 as perm_line1, p.line2 as perm_line2, p.area as perm_area, p.city as perm_city, p.state as perm_state, p.pincode as perm_pincode,
        snap.plan_name, snap.speed_mbps, snap.billing_frequency,
        snap.base_price_paisa, snap.tax_paisa, snap.installation_paisa, snap.total_paisa,
        pay.payment_id, pay.gateway_reference,
        (SELECT GROUP_CONCAT(doc_label || ' (' || original_filename || ')', '; ') FROM documents WHERE application_id = a.id) as document_list
      FROM applications a
      LEFT JOIN addresses c ON c.application_id = a.id AND c.address_type = 'CONNECTION'
      LEFT JOIN addresses p ON p.application_id = a.id AND p.address_type = 'PERMANENT'
      LEFT JOIN application_pricing_snapshots snap ON snap.application_id = a.id
      LEFT JOIN payments pay ON pay.application_id = a.id AND pay.id = (SELECT MAX(id) FROM payments WHERE application_id = a.id)
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
    `;

    const records = await query(querySql, params);

    const workbook = await generateApplicationsWorkbook(records);

    const filename = `DTN_Applications_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate Excel export',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
