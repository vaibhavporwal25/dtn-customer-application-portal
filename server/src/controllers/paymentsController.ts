import { Request, Response } from 'express';
import { execute, queryOne, saveDatabase } from '../db/database.js';

export async function initiatePayment(req: Request, res: Response): Promise<void> {
  try {
    const { applicationId } = req.body;
    if (!applicationId) {
      res.status(400).json({ success: false, message: 'Application ID is required' });
      return;
    }

    // Lookup application
    let app: any = null;
    if (typeof applicationId === 'number' || /^\d+$/.test(applicationId)) {
      app = await queryOne('SELECT * FROM applications WHERE id = ?', [parseInt(applicationId, 10)]);
    } else {
      app = await queryOne('SELECT * FROM applications WHERE application_id = ?', [applicationId]);
    }

    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    // Pricing snapshot
    const pricing = await queryOne('SELECT * FROM application_pricing_snapshots WHERE application_id = ?', [app.id]);
    if (!pricing) {
      res.status(400).json({ success: false, message: 'No pricing snapshot found for application' });
      return;
    }

    const orderId = `ORD_${app.application_id.replace(/[^A-Za-z0-9]/g, '')}_${Date.now()}`;
    const now = new Date().toISOString();

    // Check if an existing payment is already 'Paid'
    const existingPaid = await queryOne("SELECT * FROM payments WHERE application_id = ? AND status = 'Paid'", [app.id]);
    if (existingPaid) {
      res.status(400).json({
        success: false,
        message: 'This application has already been paid for.',
        data: {
          applicationId: app.application_id,
          paymentStatus: 'Paid',
          paymentId: existingPaid.payment_id
        }
      });
      return;
    }

    // Insert new payment attempt
    const result = await execute(`
      INSERT INTO payments (
        application_id, order_id, gateway, amount_paisa, currency, status, created_at, updated_at
      ) VALUES (?, ?, 'simulated', ?, 'INR', 'Pending', ?, ?)
    `, [
      app.id,
      orderId,
      pricing.total_paisa,
      now,
      now
    ]);

    // Update application payment status to Pending
    await execute("UPDATE applications SET payment_status = 'Pending', updated_at = ? WHERE id = ?", [now, app.id]);
    saveDatabase();

    res.json({
      success: true,
      data: {
        paymentId: result.lastInsertRowId,
        orderId,
        applicationId: app.application_id,
        amountPaisa: pricing.total_paisa,
        amountRupees: pricing.total_paisa / 100,
        currency: 'INR',
        mode: process.env.PAYMENT_MODE || 'simulated',
        disclaimer: 'DEMO MODE — NO REAL MONEY WILL BE CHARGED',
        plan: {
          name: pricing.plan_name,
          speedMbps: pricing.speed_mbps,
          billingFrequency: pricing.billing_frequency
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function processSimulatedPayment(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, outcome, paymentMethod, notes } = req.body;
    // outcome: 'SUCCESS' | 'FAILURE' | 'CANCEL'
    if (!orderId || !outcome) {
      res.status(400).json({ success: false, message: 'orderId and outcome are required' });
      return;
    }

    const payment = await queryOne('SELECT * FROM payments WHERE order_id = ?', [orderId]);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment order record not found' });
      return;
    }

    // Idempotency check: if already Paid, ignore repeat callbacks
    if (payment.status === 'Paid') {
      res.json({
        success: true,
        message: 'Payment already processed and marked Paid.',
        data: {
          orderId: payment.order_id,
          paymentId: payment.payment_id,
          status: 'Paid'
        }
      });
      return;
    }

    const now = new Date().toISOString();
    let newPaymentStatus = 'Pending';
    let newApplicationPaymentStatus = 'Pending';
    let generatedPaymentId: string | null = null;
    let gatewayRef: string | null = null;

    if (outcome === 'SUCCESS') {
      newPaymentStatus = 'Paid';
      newApplicationPaymentStatus = 'Paid';
      generatedPaymentId = `PAY_SIM_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      gatewayRef = `REF_DTN_UPI_${Date.now()}`;
    } else if (outcome === 'FAILURE') {
      newPaymentStatus = 'Failed';
      newApplicationPaymentStatus = 'Failed';
      gatewayRef = 'ERR_SIM_BANK_TIMEOUT';
    } else if (outcome === 'CANCEL') {
      newPaymentStatus = 'Cancelled';
      newApplicationPaymentStatus = 'Cancelled';
      gatewayRef = 'USER_CANCELLED_CHECKOUT';
    } else {
      res.status(400).json({ success: false, message: 'Invalid outcome. Must be SUCCESS, FAILURE, or CANCEL.' });
      return;
    }

    const payloadString = JSON.stringify({
      mode: 'simulated',
      outcome,
      paymentMethod: paymentMethod || 'UPI',
      notes: notes || 'Simulated demonstration transaction',
      processedAt: now
    });

    // Update payment record
    await execute(`
      UPDATE payments
      SET status = ?, payment_id = ?, payment_method = ?, gateway_reference = ?, gateway_payload = ?, updated_at = ?
      WHERE id = ?
    `, [
      newPaymentStatus,
      generatedPaymentId,
      paymentMethod || 'UPI',
      gatewayRef,
      payloadString,
      now,
      payment.id
    ]);

    // Update application payment status
    await execute(`
      UPDATE applications
      SET payment_status = ?, updated_at = ?
      WHERE id = ?
    `, [newApplicationPaymentStatus, now, payment.application_id]);

    saveDatabase();

    res.json({
      success: true,
      message: `Simulated payment result: ${outcome}`,
      data: {
        orderId: payment.order_id,
        paymentId: generatedPaymentId,
        paymentStatus: newPaymentStatus,
        applicationId: payment.application_id,
        gatewayReference: gatewayRef,
        amountRupees: payment.amount_paisa / 100,
        currency: payment.currency,
        timestamp: now,
        isDemo: true,
        disclaimer: 'DEMO MODE — NO REAL MONEY CHARGED'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process simulated payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
