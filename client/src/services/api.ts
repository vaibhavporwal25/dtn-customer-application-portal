import { FormDataState, PlanItem, SubmissionResponse } from '../types/index.js';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchPlans(): Promise<PlanItem[]> {
  const res = await fetch(`${API_BASE}/plans`);
  if (!res.ok) throw new Error('Failed to fetch internet plans');
  const json = await res.json();
  return json.data;
}

export async function uploadDocumentFile(
  file: File,
  documentType: string,
  docLabel: string,
  applicationId?: number
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  formData.append('docLabel', docLabel);
  if (applicationId) {
    formData.append('applicationId', String(applicationId));
  }

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'File upload failed');
  }
  return json.data;
}

export async function deleteDocumentFile(docId: number) {
  const res = await fetch(`${API_BASE}/documents/${docId}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to remove document');
  return json;
}

export async function submitApplicationApi(form: FormDataState): Promise<SubmissionResponse> {
  const docIds: number[] = [];
  if (form.photographDoc) docIds.push(form.photographDoc.id);
  if (form.identityProofDoc) docIds.push(form.identityProofDoc.id);
  if (form.addressProofDoc) docIds.push(form.addressProofDoc.id);
  if (form.orgProofDoc) docIds.push(form.orgProofDoc.id);

  const payload = {
    category: form.category,
    occupancyStatus: form.occupancyStatus,
    applicantTitle: form.applicantTitle,
    applicantName: form.applicantName,
    orgName: form.orgName,
    orgRepresentative: form.orgRepresentative,
    orgDesignation: form.orgDesignation,
    dob: form.dob,
    gender: form.gender,
    existingCustomer: form.existingCustomer,
    consumerNumber: form.consumerNumber,
    contactNumber: form.contactNumber,
    contactEmail: form.contactEmail,
    connectionAddress: form.connectionAddress,
    permanentAddress: form.sameAsConnectionAddress ? form.connectionAddress : form.permanentAddress,
    sameAsConnectionAddress: form.sameAsConnectionAddress,
    planId: form.planId,
    billingFrequency: form.billingFrequency,
    declarationAccepted: form.declarationAccepted,
    uploadedDocumentIds: docIds,
    notes: form.notes
  };

  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to submit application');
  }
  return json.data;
}

export async function fetchApplicationDetails(id: string | number) {
  const res = await fetch(`${API_BASE}/applications/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load application');
  return json.data;
}

export async function initiatePaymentApi(applicationId: string | number) {
  const res = await fetch(`${API_BASE}/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to initialize payment');
  return json.data;
}

export async function simulatePaymentApi(orderId: string, outcome: 'SUCCESS' | 'FAILURE' | 'CANCEL', paymentMethod?: string) {
  const res = await fetch(`${API_BASE}/payments/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, outcome, paymentMethod })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Payment simulation failed');
  return json.data;
}

// Admin APIs
export async function adminLoginApi(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
}

export async function fetchAdminStats(token: string) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch admin stats');
  return json.data;
}

export async function fetchAdminApplications(token: string, params: Record<string, string | number>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });

  const res = await fetch(`${API_BASE}/admin/applications?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load applications');
  return json;
}

export async function fetchAdminApplicationDetail(token: string, id: number) {
  const res = await fetch(`${API_BASE}/admin/applications/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load application detail');
  return json.data;
}

export async function updateApplicationStatusApi(token: string, id: number, status: string, notes?: string) {
  const res = await fetch(`${API_BASE}/admin/applications/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, notes })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update status');
  return json.data;
}

export function getDocumentPreviewUrl(docId: number, token?: string): string {
  return token ? `${API_BASE}/documents/${docId}/preview?token=${encodeURIComponent(token)}` : `${API_BASE}/documents/${docId}/preview`;
}

export function getDocumentDownloadUrl(docId: number, token?: string): string {
  return token ? `${API_BASE}/documents/${docId}/download?token=${encodeURIComponent(token)}` : `${API_BASE}/documents/${docId}/download`;
}

export function getExcelExportUrl(params: Record<string, string | number>, token?: string): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });
  if (token) {
    query.append('token', token);
  }
  return `${API_BASE}/admin/export?${query.toString()}`;
}

export async function downloadExcelExport(token: string, params: Record<string, string | number>): Promise<void> {
  const url = getExcelExportUrl(params, token);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Excel export request failed');
  }
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `DTN_Applications_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}
