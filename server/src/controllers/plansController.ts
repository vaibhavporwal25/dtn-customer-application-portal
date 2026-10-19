import { Request, Response } from 'express';
import { query, queryOne } from '../db/database.js';
import { PlanRecord, BillingFrequency } from '../types/index.js';

export function calculatePlanPricing(plan: PlanRecord, frequency: BillingFrequency) {
  let basePricePaisa = plan.monthly_price_paisa;
  let installationPaisa = plan.installation_fee_paisa;

  switch (frequency) {
    case 'Quarterly':
      basePricePaisa = plan.quarterly_price_paisa;
      break;
    case 'Half-Yearly':
      basePricePaisa = plan.half_yearly_price_paisa;
      installationPaisa = Math.round(plan.installation_fee_paisa * 0.5); // 50% discount on installation
      break;
    case 'Annual':
      basePricePaisa = plan.annual_price_paisa;
      installationPaisa = 0; // Free installation on annual plans
      break;
    case 'Monthly':
    default:
      basePricePaisa = plan.monthly_price_paisa;
      installationPaisa = plan.installation_fee_paisa;
      break;
  }

  // 18% GST in telecom
  const gstRate = plan.gst_rate_percent || 18.0;
  const taxPaisa = Math.round((basePricePaisa * gstRate) / 100);
  const totalPaisa = basePricePaisa + taxPaisa + installationPaisa;

  return {
    billingFrequency: frequency,
    basePricePaisa,
    basePriceRupees: basePricePaisa / 100,
    gstRatePercent: gstRate,
    taxPaisa,
    taxRupees: taxPaisa / 100,
    installationPaisa,
    installationRupees: installationPaisa / 100,
    totalPaisa,
    totalRupees: totalPaisa / 100,
    currency: 'INR'
  };
}

export async function getPlans(req: Request, res: Response): Promise<void> {
  try {
    const plans = await query<PlanRecord>('SELECT * FROM plans WHERE is_active = 1 ORDER BY monthly_price_paisa ASC');
    
    const formatted = plans.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      speedMbps: p.speed_mbps,
      dataAllowance: p.data_allowance,
      description: p.description,
      isDemo: true,
      demoDisclaimer: 'DEMO PLAN — SAMPLE PRICE, NOT AN OFFICIAL DTN INDIA OFFER',
      frequencies: {
        Monthly: calculatePlanPricing(p, 'Monthly'),
        Quarterly: calculatePlanPricing(p, 'Quarterly'),
        'Half-Yearly': calculatePlanPricing(p, 'Half-Yearly'),
        Annual: calculatePlanPricing(p, 'Annual')
      }
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      disclaimer: 'All displayed plans and rates are demonstration samples and do not represent official DTN India commercial tariffs.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internet plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getPlanById(req: Request, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid plan ID' }); return; }
    const plan = await queryOne<PlanRecord>('SELECT * FROM plans WHERE id = ?', [id]);
    
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...plan,
        isDemo: true,
        demoDisclaimer: 'DEMO PLAN — SAMPLE PRICE, NOT AN OFFICIAL DTN INDIA OFFER',
        pricing: {
          Monthly: calculatePlanPricing(plan, 'Monthly'),
          Quarterly: calculatePlanPricing(plan, 'Quarterly'),
          'Half-Yearly': calculatePlanPricing(plan, 'Half-Yearly'),
          Annual: calculatePlanPricing(plan, 'Annual')
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
