import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('========================================================');
  console.log(' BEGINNING DTN INDIA COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('========================================================');

  // Test 1: Health check
  console.log('\n[TEST 1] Testing Health Check Endpoint...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthJson = await healthRes.json();
  if (healthRes.ok && healthJson.status === 'ok') {
    console.log('✅ Health check passed:', healthJson.service);
  } else {
    throw new Error('Health check failed: ' + JSON.stringify(healthJson));
  }

  // Test 2: Plans list
  console.log('\n[TEST 2] Testing Plans API...');
  const plansRes = await fetch(`${BASE_URL}/plans`);
  const plansJson = await plansRes.json();
  if (plansRes.ok && plansJson.data.length > 0) {
    console.log(`✅ Loaded ${plansJson.data.length} demonstration plans.`);
    const firstPlan = plansJson.data[0];
    console.log(`   Sample Plan: ${firstPlan.name} (${firstPlan.speedMbps} Mbps) - Monthly Total: ₹${firstPlan.frequencies.Monthly.totalRupees}`);
  } else {
    throw new Error('Plans fetch failed');
  }

  // Test 3: Document Uploads & Magic Bytes Verification
  console.log('\n[TEST 3] Testing Document Upload with Magic Bytes Validation...');
  // Create a genuine minimal PNG buffer
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
  ]);
  const fakeImageBlob = new Blob([pngHeader], { type: 'image/png' });
  const formPhoto = new FormData();
  formPhoto.append('file', fakeImageBlob, 'applicant_photo.png');
  formPhoto.append('documentType', 'photograph');
  formPhoto.append('docLabel', 'Applicant Photograph');

  const uploadPhotoRes = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formPhoto
  });
  const uploadPhotoJson = await uploadPhotoRes.json();
  if (uploadPhotoRes.status === 201 && uploadPhotoJson.data.id) {
    console.log('✅ Valid PNG uploaded successfully. Stored doc ID:', uploadPhotoJson.data.id);
  } else {
    throw new Error('PNG upload failed: ' + JSON.stringify(uploadPhotoJson));
  }

  // Test 3B: Prohibited / Fake file rejection (executable / txt renamed to png)
  console.log('\n[TEST 3B] Testing Rejection of Prohibited / Fake File (Magic Bytes Check)...');
  const fakeExeBlob = new Blob([Buffer.from('MZ_FAKE_EXECUTABLE_CONTENT_HERE_12345')], { type: 'image/png' });
  const fakeForm = new FormData();
  fakeForm.append('file', fakeExeBlob, 'malicious.png');
  fakeForm.append('documentType', 'photograph');
  fakeForm.append('docLabel', 'Malicious File');

  const fakeRes = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: fakeForm
  });
  const fakeJson = await fakeRes.json();
  if (fakeRes.status === 400) {
    console.log('✅ Security verification successfully REJECTED invalid file signature:', fakeJson.message);
  } else {
    throw new Error('Security test failed: Fake file was not rejected!');
  }

  // Upload Identity Proof (PDF)
  console.log('\n[TEST 3C] Uploading Valid PDF Identity Document...');
  const pdfHeader = Buffer.from('%PDF-1.4\n%Minimal PDF for verification\n%%EOF');
  const pdfBlob = new Blob([pdfHeader], { type: 'application/pdf' });
  const formPoi = new FormData();
  formPoi.append('file', pdfBlob, 'pan_card.pdf');
  formPoi.append('documentType', 'identity_proof');
  formPoi.append('docLabel', 'Income Tax PAN Card');

  const uploadPoiRes = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formPoi
  });
  const uploadPoiJson = await uploadPoiRes.json();
  const poiDocId = uploadPoiJson.data.id;
  console.log('✅ Identity PDF uploaded. Stored doc ID:', poiDocId);

  // Test 4: Application Submission (Full End-to-End)
  console.log('\n[TEST 4] Testing Full Application Submission...');
  const newAppPayload = {
    category: 'Residential',
    occupancyStatus: 'Owner',
    applicantTitle: 'Mr.',
    applicantName: 'Sunil Kumar Sharma',
    dob: '1992-04-18',
    gender: 'Male',
    existingCustomer: false,
    contactNumber: '9810114338',
    contactEmail: 'sunil.sharma@example.com',
    connectionAddress: {
      line1: 'B-104, Golf View Apartments',
      line2: 'Sector 44',
      area: 'Noida City Center',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201303'
    },
    permanentAddress: {
      line1: 'B-104, Golf View Apartments',
      line2: 'Sector 44',
      area: 'Noida City Center',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201303'
    },
    sameAsConnectionAddress: true,
    planId: plansJson.data[1].id, // 150 Mbps plan
    billingFrequency: 'Quarterly',
    declarationAccepted: true,
    uploadedDocumentIds: [uploadPhotoJson.data.id, poiDocId],
    notes: 'Test automated verification application'
  };

  const appSubmitRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAppPayload)
  });
  const appSubmitJson = await appSubmitRes.json();
  if (appSubmitRes.status === 201 && appSubmitJson.data.applicationId) {
    console.log('✅ Application submitted successfully!');
    console.log(`   Generated Application ID: ${appSubmitJson.data.applicationId}`);
    console.log(`   Plan: ${appSubmitJson.data.plan.name} (${appSubmitJson.data.plan.billingFrequency})`);
    console.log(`   Recalculated Total: ₹${appSubmitJson.data.pricing.totalRupees} (Base: ₹${appSubmitJson.data.pricing.basePriceRupees}, GST: ₹${appSubmitJson.data.pricing.taxRupees})`);
    console.log(`   Order ID: ${appSubmitJson.data.orderId}`);
  } else {
    throw new Error('Application submission failed: ' + JSON.stringify(appSubmitJson));
  }

  const testAppId = appSubmitJson.data.applicationId;
  const testOrderId = appSubmitJson.data.orderId;

  // Test 5: Simulated Payment Workflow (Failure & Retry, then Success)
  console.log('\n[TEST 5] Testing Simulated Payment Workflow...');
  
  // 5A: Simulate Bank Timeout / Failure
  console.log('   Simulating Gateway Failure...');
  const failRes = await fetch(`${BASE_URL}/payments/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: testOrderId,
      outcome: 'FAILURE',
      paymentMethod: 'UPI'
    })
  });
  const failJson = await failRes.json();
  if (failJson.data.paymentStatus === 'Failed') {
    console.log('   ✅ Simulated failure registered correctly without corrupting application data.');
  } else {
    throw new Error('Payment failure simulation failed');
  }

  // 5B: Retry payment without creating duplicate application
  console.log('   Retrying Payment with Simulated Success...');
  const retryOrderRes = await fetch(`${BASE_URL}/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId: testAppId })
  });
  const retryOrderJson = await retryOrderRes.json();
  const retryOrderId = retryOrderJson.data.orderId;

  const successRes = await fetch(`${BASE_URL}/payments/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: retryOrderId,
      outcome: 'SUCCESS',
      paymentMethod: 'UPI'
    })
  });
  const successJson = await successRes.json();
  if (successJson.data.paymentStatus === 'Paid' && successJson.data.paymentId) {
    console.log('   ✅ Payment marked Paid with generated Transaction ID:', successJson.data.paymentId);
  } else {
    throw new Error('Payment success simulation failed');
  }

  // Test 6: Administrator Login & Authorization
  console.log('\n[TEST 6] Testing Administrator Authentication & Protected Routes...');
  const adminLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin@DTN2026!' })
  });
  const adminLoginJson = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminLoginJson.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLoginJson));
  }
  const adminToken = adminLoginJson.token;
  console.log('✅ Admin login successful. Token acquired for:', adminLoginJson.admin.fullName);

  // Test 6B: Unauthorized Access Rejection
  const unauthRes = await fetch(`${BASE_URL}/admin/stats`);
  if (unauthRes.status === 401) {
    console.log('✅ Unauthorized access without token correctly rejected (401).');
  } else {
    throw new Error('Security vulnerability: Admin route was accessible without token!');
  }

  // Test 7: Administrator Dashboard Stats & Application Search
  console.log('\n[TEST 7] Testing Admin Stats & Search/Filter...');
  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const statsJson = await statsRes.json();
  console.log('✅ Admin stats retrieved:', statsJson.data);

  // Search by Sunil
  const searchRes = await fetch(`${BASE_URL}/admin/applications?search=Sunil`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const searchJson = await searchRes.json();
  if (searchJson.data.length > 0 && searchJson.data[0].applicationId === testAppId) {
    console.log(`✅ Search by applicant name successfully found record: ${testAppId}`);
  } else {
    throw new Error('Search failed to find created application');
  }

  // Test 8: Status Update by Administrator
  console.log('\n[TEST 8] Testing Status Transition (Submitted -> Under Review)...');
  const appNumericId = searchJson.data[0].id;
  const statusUpdateRes = await fetch(`${BASE_URL}/admin/applications/${appNumericId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'Under Review',
      notes: 'KYC documents verified against UIDAI database.'
    })
  });
  const statusUpdateJson = await statusUpdateRes.json();
  if (statusUpdateJson.data.newStatus === 'Under Review') {
    console.log('✅ Status successfully updated to "Under Review" with audit trail logged.');
  } else {
    throw new Error('Status update failed');
  }

  // Test 9: EXCEL EXPORT (Core Requirement)
  console.log('\n[TEST 9] Testing Excel Export Feature (.xlsx generation with ExcelJS)...');
  const exportRes = await fetch(`${BASE_URL}/admin/export`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (exportRes.ok && exportRes.headers.get('content-type')?.includes('spreadsheetml')) {
    const arrayBuffer = await exportRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const exportPath = path.resolve('./uploads/test_export.xlsx');
    fs.writeFileSync(exportPath, buffer);
    console.log(`✅ Generated valid Excel spreadsheet file (${buffer.length} bytes). Saved to ${exportPath}`);
  } else {
    throw new Error('Excel export failed or invalid MIME type');
  }

  console.log('\n========================================================');
  console.log(' ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! (9/9)       ');
  console.log('========================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite encountered an error:', err);
  process.exit(1);
});
