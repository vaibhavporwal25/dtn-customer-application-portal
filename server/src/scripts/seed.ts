import bcrypt from 'bcryptjs';
import { getDatabase, execute, query, saveDatabase } from '../db/database.js';

export async function seedDatabase() {
  console.log('--- Initializing DTN India Database & Seed Data ---');
  await getDatabase();

  // Check if plans exist
  const existingPlans = await query('SELECT COUNT(*) as count FROM plans');
  if (existingPlans[0]?.count === 0) {
    console.log('Seeding demonstration internet plans...');
    const plans = [
      {
        code: 'DTN-FIBRE-50',
        name: 'DTN Starter Fibre 50M',
        category: 'Residential',
        speed_mbps: 50,
        data_allowance: 'Unlimited Data (3300 GB FUP)',
        monthly_price_paisa: 49900,
        quarterly_price_paisa: 142200,
        half_yearly_price_paisa: 269400,
        annual_price_paisa: 479000,
        installation_fee_paisa: 100000,
        gst_rate_percent: 18.0,
        description: 'DEMO PLAN — SAMPLE PRICE, NOT AN OFFICIAL DTN INDIA OFFER. Ideal for everyday browsing, streaming, and student work.'
      },
      {
        code: 'DTN-FIBRE-150',
        name: 'DTN Premium Fibre 150M',
        category: 'Residential',
        speed_mbps: 150,
        data_allowance: 'Unlimited Data (3300 GB FUP)',
        monthly_price_paisa: 79900,
        quarterly_price_paisa: 227700,
        half_yearly_price_paisa: 431400,
        annual_price_paisa: 767000,
        installation_fee_paisa: 100000,
        gst_rate_percent: 18.0,
        description: 'DEMO PLAN — SAMPLE PRICE, NOT AN OFFICIAL DTN INDIA OFFER. High-speed 4K streaming, simultaneous multi-device households, and smart home.'
      },
      {
        code: 'DTN-FIBRE-300',
        name: 'DTN Ultra Giga 300M',
        category: 'Residential',
        speed_mbps: 300,
        data_allowance: 'Unlimited Data (3300 GB FUP)',
        monthly_price_paisa: 119900,
        quarterly_price_paisa: 341700,
        half_yearly_price_paisa: 647400,
        annual_price_paisa: 1151000,
        installation_fee_paisa: 100000,
        gst_rate_percent: 18.0,
        description: 'DEMO PLAN — SAMPLE PRICE, NOT AN OFFICIAL DTN INDIA OFFER. Pro gaming, zero-lag video conferencing, massive downloads, and heavy creator workflows.'
      },
      {
        code: 'DTN-BIZ-500',
        name: 'DTN Enterprise Fibre 500M',
        category: 'Corporate',
        speed_mbps: 500,
        data_allowance: 'Unlimited Enterprise Bandwidth (Priority SLA)',
        monthly_price_paisa: 249900,
        quarterly_price_paisa: 712200,
        half_yearly_price_paisa: 1349400,
        annual_price_paisa: 2399000,
        installation_fee_paisa: 200000,
        gst_rate_percent: 18.0,
        description: 'DEMO PLAN — SAMPLE PRICE, NOT AN OFFICIAL DTN INDIA OFFER. Symmetrical upload/download, 99.5% uptime commitment, dedicated 24x7 NOC support.'
      }
    ];

    for (const p of plans) {
      await execute(`
        INSERT INTO plans (
          code, name, category, speed_mbps, data_allowance,
          monthly_price_paisa, quarterly_price_paisa, half_yearly_price_paisa,
          annual_price_paisa, installation_fee_paisa, gst_rate_percent, is_active, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `, [
        p.code, p.name, p.category, p.speed_mbps, p.data_allowance,
        p.monthly_price_paisa, p.quarterly_price_paisa, p.half_yearly_price_paisa,
        p.annual_price_paisa, p.installation_fee_paisa, p.gst_rate_percent, p.description
      ]);
    }
    console.log('Seeded 4 demonstration internet plans.');
  }

  // Check if admin exists or if rotation was requested
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dtnindia.com';
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD;
  const rotateRequested = process.env.ADMIN_ROTATE_PASSWORD === 'true';

  const existingAdmins = await query('SELECT id, username, email FROM admins WHERE username = ? OR email = ?', [
    adminUsername,
    adminEmail
  ]);

  if (existingAdmins.length === 0) {
    console.log('[Seed] Initializing administrator account...');
    // In production, require ADMIN_PASSWORD in environment. For local development, fallback if not set.
    const resolvedPassword = adminPassword || (process.env.NODE_ENV !== 'production' ? 'DevAdmin@DTN2026!' : null);

    if (resolvedPassword) {
      const salt = bcrypt.genSaltSync(12);
      const hash = bcrypt.hashSync(resolvedPassword, salt);

      await execute(`
        INSERT INTO admins (username, email, password_hash, full_name, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        adminUsername,
        adminEmail,
        hash,
        'DTN System Administrator',
        'superadmin',
        new Date().toISOString()
      ]);
      console.log(`[Seed] Administrator account (${adminUsername}) created successfully.`);
    } else {
      console.warn('[Seed] WARNING: ADMIN_PASSWORD environment variable not configured in production. Set ADMIN_PASSWORD on Render.');
    }
  } else if (rotateRequested && adminPassword) {
    console.log(`[Seed] ADMIN_ROTATE_PASSWORD detected. Rotating password for administrator: ${adminUsername}...`);
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(adminPassword, salt);
    await execute(`
      UPDATE admins SET password_hash = ? WHERE username = ? OR email = ?
    `, [hash, adminUsername, adminEmail]);
    console.log(`[Seed] Administrator credentials rotated successfully.`);
  }

  // Check if we should seed a few sample applications for demonstration inspection
  const existingApps = await query('SELECT COUNT(*) as count FROM applications');
  if (existingApps[0]?.count === 0) {
    console.log('Seeding 2 sample demonstration applications...');
    const now = new Date();
    
    // Sample Application 1: Residential
    const app1Res = await execute(`
      INSERT INTO applications (
        application_id, category, occupancy_status, applicant_title, applicant_name,
        dob, gender, existing_customer, contact_number, contact_email,
        declaration_accepted, declaration_terms_version, declaration_timestamp,
        status, payment_status, notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        1, 'v1.0-demo', ?,
        'Under Review', 'Paid', 'Demo application: residential fiber connection with verified documents', ?, ?
      )
    `, [
      'DTN-2026-000101', 'Residential', 'Owner', 'Mr.', 'Rajesh Kumar Verma',
      '1988-06-14', 'Male', 0, '9810114338', 'rajesh.verma@example.com',
      now.toISOString(), now.toISOString(), now.toISOString()
    ]);

    const app1Id = app1Res.lastInsertRowId;

    // Connection address
    await execute(`
      INSERT INTO addresses (application_id, address_type, line1, line2, area, city, state, pincode)
      VALUES (?, 'CONNECTION', 'Flat 402, Sunshine Heights', 'Sector 62', 'Noida Industrial Area', 'Noida', 'Uttar Pradesh', '201309')
    `, [app1Id]);

    // Permanent address
    await execute(`
      INSERT INTO addresses (application_id, address_type, line1, line2, area, city, state, pincode)
      VALUES (?, 'PERMANENT', 'Flat 402, Sunshine Heights', 'Sector 62', 'Noida Industrial Area', 'Noida', 'Uttar Pradesh', '201309')
    `, [app1Id]);

    // Pricing snapshot
    await execute(`
      INSERT INTO application_pricing_snapshots (
        application_id, plan_id, plan_name, speed_mbps, data_allowance,
        billing_frequency, base_price_paisa, tax_paisa, installation_paisa, total_paisa, currency, snapshot_timestamp
      ) VALUES (?, 2, 'DTN Premium Fibre 150M', 150, 'Unlimited Data (3300 GB FUP)', 'Monthly', 79900, 14382, 100000, 194282, 'INR', ?)
    `, [app1Id, now.toISOString()]);

    // Payment record
    await execute(`
      INSERT INTO payments (
        application_id, order_id, payment_id, gateway, amount_paisa, currency, status, payment_method, gateway_reference, gateway_payload, created_at, updated_at
      ) VALUES (?, 'ORD_DTN_DEMO_001', 'PAY_SIM_9876543210', 'simulated', 194282, 'INR', 'Paid', 'UPI', 'UPI_RR_987654321', '{"mode":"simulated","status":"SUCCESS","demo":true}', ?, ?)
    `, [app1Id, now.toISOString(), now.toISOString()]);

    // Sample Application 2: SME Corporate
    const app2Res = await execute(`
      INSERT INTO applications (
        application_id, category, applicant_title, applicant_name,
        org_name, org_representative, org_designation,
        existing_customer, consumer_number, contact_number, contact_email,
        declaration_accepted, declaration_terms_version, declaration_timestamp,
        status, payment_status, notes, created_at, updated_at
      ) VALUES (
        ?, 'SME', 'Ms.', 'Pooja Sharma',
        'TechVanguard Solutions LLP', 'Pooja Sharma', 'Managing Partner',
        1, 'DTN-CONS-49210', '9818822334', 'pooja@techvanguard.in',
        1, 'v1.0-demo', ?,
        'Submitted', 'Pending', 'Existing customer expanding lease line to new corporate branch', ?, ?
      )
    `, [
      'DTN-2026-000102', now.toISOString(), now.toISOString(), now.toISOString()
    ]);

    const app2Id = app2Res.lastInsertRowId;

    await execute(`
      INSERT INTO addresses (application_id, address_type, line1, line2, area, city, state, pincode)
      VALUES (?, 'CONNECTION', 'Suite 501, Cyber Park', 'Phase 3, Udyog Vihar', 'Gurugram Central', 'Gurugram', 'Haryana', '122016')
    `, [app2Id]);

    await execute(`
      INSERT INTO addresses (application_id, address_type, line1, line2, area, city, state, pincode)
      VALUES (?, 'PERMANENT', 'Plot 18, Commercial Block B', 'Okhla Industrial Area Phase 1', 'South Delhi', 'New Delhi', 'Delhi', '110020')
    `, [app2Id]);

    await execute(`
      INSERT INTO application_pricing_snapshots (
        application_id, plan_id, plan_name, speed_mbps, data_allowance,
        billing_frequency, base_price_paisa, tax_paisa, installation_paisa, total_paisa, currency, snapshot_timestamp
      ) VALUES (?, 4, 'DTN Enterprise Fibre 500M', 500, 'Unlimited Enterprise Bandwidth (Priority SLA)', 'Quarterly', 712200, 128196, 200000, 1040396, 'INR', ?)
    `, [app2Id, now.toISOString()]);

    await execute(`
      INSERT INTO payments (
        application_id, order_id, gateway, amount_paisa, currency, status, payment_method, created_at, updated_at
      ) VALUES (?, 'ORD_DTN_DEMO_002', 'simulated', 1040396, 'INR', 'Pending', 'NetBanking', ?, ?)
    `, [app2Id, now.toISOString(), now.toISOString()]);

    console.log('Seeded 2 sample demonstration applications.');
  }

  saveDatabase();
  console.log('Database initialized successfully.');
}

if (process.argv[1] && process.argv[1].includes('seed')) {
  seedDatabase().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
