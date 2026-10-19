import ExcelJS from 'exceljs';
import { Response } from 'express';

// Sanitize string to prevent formula injection in Excel (CSV / XLSX injection defense)
function sanitizeForExcel(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.length === 0) return '';
  // If string starts with =, +, -, @, or tab/carriage return, prepend with single quote
  if (/^[=\+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export async function generateApplicationsWorkbook(applications: any[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DTN India Portal';
  workbook.lastModifiedBy = 'DTN System Administrator';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Customer Applications', {
    pageSetup: { orientation: 'landscape' },
    views: [{ state: 'frozen', ySplit: 4 }]
  });

  // Title Banner
  worksheet.mergeCells('A1:AC1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'DIGITAL TELCO NETWORK INDIA PVT. LTD. (DTN INDIA)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0E272B' } // DTN Deep Teal
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 30;

  // Subtitle / Export info
  worksheet.mergeCells('A2:AC2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Customer Application Records Export — Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST | Total Records: ${applications.length}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF334155' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Blank spacer row
  worksheet.getRow(3).height = 10;

  // Column Definitions
  worksheet.columns = [
    { header: 'Application ID', key: 'appId', width: 18 },
    { header: 'Applicant Category', key: 'category', width: 18 },
    { header: 'Occupancy Status', key: 'occupancy', width: 16 },
    { header: 'Title', key: 'title', width: 8 },
    { header: 'Applicant Name', key: 'name', width: 24 },
    { header: 'Organization Name', key: 'orgName', width: 26 },
    { header: 'Authorized Representative', key: 'orgRep', width: 24 },
    { header: 'Representative Designation', key: 'orgDesig', width: 22 },
    { header: 'Date of Birth', key: 'dob', width: 14 },
    { header: 'Gender', key: 'gender', width: 12 },
    { header: 'Existing Customer', key: 'existingCustomer', width: 16 },
    { header: 'Consumer Number', key: 'consumerNumber', width: 18 },
    { header: 'Contact Mobile', key: 'contactNumber', width: 16 },
    { header: 'Contact Email', key: 'contactEmail', width: 26 },
    { header: 'Connection Address', key: 'connAddress', width: 30 },
    { header: 'Connection Area', key: 'connArea', width: 20 },
    { header: 'Connection City', key: 'connCity', width: 16 },
    { header: 'Connection State', key: 'connState', width: 16 },
    { header: 'Connection PIN Code', key: 'connPin', width: 16 },
    { header: 'Permanent Address', key: 'permAddress', width: 30 },
    { header: 'Permanent Area', key: 'permArea', width: 20 },
    { header: 'Permanent City', key: 'permCity', width: 16 },
    { header: 'Permanent State', key: 'permState', width: 16 },
    { header: 'Permanent PIN Code', key: 'permPin', width: 16 },
    { header: 'Selected Internet Plan', key: 'planName', width: 24 },
    { header: 'Speed (Mbps)', key: 'speed', width: 14 },
    { header: 'Billing Frequency', key: 'billingFrequency', width: 16 },
    { header: 'Base Plan Price (INR)', key: 'basePrice', width: 20 },
    { header: 'Taxes & GST 18% (INR)', key: 'taxPrice', width: 20 },
    { header: 'Installation Fee (INR)', key: 'installationPrice', width: 20 },
    { header: 'Total Payable Amount (INR)', key: 'totalAmount', width: 24 },
    { header: 'Declaration Acceptance', key: 'declaration', width: 20 },
    { header: 'Application Status', key: 'appStatus', width: 18 },
    { header: 'Payment Status', key: 'paymentStatus', width: 16 },
    { header: 'Payment Reference', key: 'paymentRef', width: 22 },
    { header: 'Submission Date & Time', key: 'createdAt', width: 22 },
    { header: 'Uploaded Documents', key: 'documents', width: 36 }
  ];

  // Header Row Formatting (Row 4)
  const headerRow = worksheet.getRow(4);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF12373D' } // DTN Teal Header
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'medium', color: { argb: 'FFE59836' } }, // DTN Gold Bottom Border
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });

  // Enable AutoFilter on data headers
  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4, column: worksheet.columns.length }
  };

  // Add Data Rows
  applications.forEach((app, index) => {
    const row = worksheet.addRow([
      sanitizeForExcel(app.application_id),
      sanitizeForExcel(app.category),
      sanitizeForExcel(app.occupancy_status || 'N/A'),
      sanitizeForExcel(app.applicant_title || ''),
      sanitizeForExcel(app.applicant_name),
      sanitizeForExcel(app.org_name || 'N/A'),
      sanitizeForExcel(app.org_representative || 'N/A'),
      sanitizeForExcel(app.org_designation || 'N/A'),
      sanitizeForExcel(app.dob || 'N/A'),
      sanitizeForExcel(app.gender || 'N/A'),
      app.existing_customer ? 'Yes' : 'No',
      sanitizeForExcel(app.consumer_number || 'N/A'),
      sanitizeForExcel(app.contact_number),
      sanitizeForExcel(app.contact_email),
      sanitizeForExcel(app.conn_line1 ? `${app.conn_line1}${app.conn_line2 ? ', ' + app.conn_line2 : ''}` : 'N/A'),
      sanitizeForExcel(app.conn_area || 'N/A'),
      sanitizeForExcel(app.conn_city || 'N/A'),
      sanitizeForExcel(app.conn_state || 'N/A'),
      sanitizeForExcel(app.conn_pincode || 'N/A'),
      sanitizeForExcel(app.perm_line1 ? `${app.perm_line1}${app.perm_line2 ? ', ' + app.perm_line2 : ''}` : 'N/A'),
      sanitizeForExcel(app.perm_area || 'N/A'),
      sanitizeForExcel(app.perm_city || 'N/A'),
      sanitizeForExcel(app.perm_state || 'N/A'),
      sanitizeForExcel(app.perm_pincode || 'N/A'),
      sanitizeForExcel(app.plan_name || 'N/A'),
      app.speed_mbps || 0,
      sanitizeForExcel(app.billing_frequency || 'N/A'),
      (app.base_price_paisa ? app.base_price_paisa / 100 : 0),
      (app.tax_paisa ? app.tax_paisa / 100 : 0),
      (app.installation_paisa ? app.installation_paisa / 100 : 0),
      (app.total_paisa ? app.total_paisa / 100 : 0),
      app.declaration_accepted ? `Accepted (${app.declaration_terms_version || 'v1.0'})` : 'No',
      sanitizeForExcel(app.status),
      sanitizeForExcel(app.payment_status),
      sanitizeForExcel(app.payment_id || app.gateway_reference || 'N/A'),
      app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A',
      sanitizeForExcel(app.document_list || 'None')
    ]);

    row.height = 22;

    // Alternating zebra row backgrounds
    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 9 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.alignment = { vertical: 'middle' };

      // Number & Currency formatting
      // Columns 28, 29, 30, 31 are base price, tax, install, total
      if ([28, 29, 30, 31].includes(colNumber)) {
        cell.numFmt = '₹#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }
      // Speed column
      if (colNumber === 26) {
        cell.numFmt = '#,##0';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      // Status formatting colors
      if (colNumber === 33) { // Application Status
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (cell.value === 'Approved') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF15803D' } };
        } else if (cell.value === 'Rejected') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFB91C1C' } };
        } else if (cell.value === 'Under Review') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFB45309' } };
        }
      }
      if (colNumber === 34) { // Payment Status
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (cell.value === 'Paid') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF15803D' } };
        } else if (cell.value === 'Failed' || cell.value === 'Cancelled') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFB91C1C' } };
        } else if (cell.value === 'Pending') {
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFB45309' } };
        }
      }
    });
  });

  return workbook;
}
