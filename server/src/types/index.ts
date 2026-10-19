export type ApplicantCategory =
  | 'Residential'
  | 'SME'
  | 'Corporate'
  | 'Wholesale'
  | 'NGO'
  | 'Educational Institution'
  | 'Government';

export type ResidentialOccupancy = 'Owner' | 'Tenant';

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export type PaymentStatus = 'Not Initiated' | 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';

export type BillingFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';

export interface AddressInput {
  line1: string;
  line2?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ApplicationSubmissionPayload {
  category: ApplicantCategory;
  occupancyStatus?: ResidentialOccupancy;
  applicantTitle?: string;
  applicantName: string;
  orgName?: string;
  orgRepresentative?: string;
  orgDesignation?: string;
  dob?: string;
  gender?: string;
  existingCustomer: boolean;
  consumerNumber?: string;
  contactNumber: string;
  contactEmail: string;
  connectionAddress: AddressInput;
  permanentAddress: AddressInput;
  sameAsConnectionAddress: boolean;
  planId: number;
  billingFrequency: BillingFrequency;
  declarationAccepted: boolean;
  uploadedDocumentIds?: number[];
  notes?: string;
}

export interface PlanRecord {
  id: number;
  code: string;
  name: string;
  category: string;
  speed_mbps: number;
  data_allowance: string;
  monthly_price_paisa: number;
  quarterly_price_paisa: number;
  half_yearly_price_paisa: number;
  annual_price_paisa: number;
  installation_fee_paisa: number;
  gst_rate_percent: number;
  is_active: number;
  description: string;
}

export interface DocumentRecord {
  id: number;
  application_id: number;
  document_type: string;
  doc_label: string;
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}
