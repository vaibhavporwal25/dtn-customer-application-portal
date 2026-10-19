export type ApplicantCategory =
  | 'Residential'
  | 'SME'
  | 'Corporate'
  | 'Wholesale'
  | 'NGO'
  | 'Educational Institution'
  | 'Government';

export type ResidentialOccupancy = 'Owner' | 'Tenant';

export type BillingFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export type PaymentStatus = 'Not Initiated' | 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';

export interface AddressData {
  line1: string;
  line2?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UploadedDocInfo {
  id: number;
  documentType: string;
  docLabel: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  previewUrl?: string;
}

export interface FormDataState {
  // Step 1: Applicant Details
  category: ApplicantCategory;
  occupancyStatus?: ResidentialOccupancy;
  applicantTitle: string;
  applicantName: string;
  orgName?: string;
  orgRepresentative?: string;
  orgDesignation?: string;
  dob: string;
  gender: string;
  existingCustomer: boolean;
  consumerNumber?: string;
  contactNumber: string;
  contactEmail: string;

  // Step 2: Address Details
  connectionAddress: AddressData;
  permanentAddress: AddressData;
  sameAsConnectionAddress: boolean;

  // Step 3: Plan and Billing
  planId: number | null;
  billingFrequency: BillingFrequency;

  // Step 4: Documents
  photographDoc: UploadedDocInfo | null;
  identityProofDoc: UploadedDocInfo | null;
  identityDocType: string;
  addressProofDoc: UploadedDocInfo | null;
  addressDocType: string;
  orgProofDoc: UploadedDocInfo | null;
  orgDocType: string;

  // Step 5: Declaration
  declarationAccepted: boolean;
  notes?: string;
}

export interface PlanPricingFrequency {
  billingFrequency: BillingFrequency;
  basePricePaisa: number;
  basePriceRupees: number;
  gstRatePercent: number;
  taxPaisa: number;
  taxRupees: number;
  installationPaisa: number;
  installationRupees: number;
  totalPaisa: number;
  totalRupees: number;
  currency: string;
}

export interface PlanItem {
  id: number;
  code: string;
  name: string;
  category: string;
  speedMbps: number;
  dataAllowance: string;
  description: string;
  isDemo: boolean;
  demoDisclaimer: string;
  frequencies: {
    Monthly: PlanPricingFrequency;
    Quarterly: PlanPricingFrequency;
    'Half-Yearly': PlanPricingFrequency;
    Annual: PlanPricingFrequency;
  };
}

export interface SubmissionResponse {
  id: number;
  applicationId: string;
  applicantName: string;
  category: string;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  plan: {
    name: string;
    speedMbps: number;
    billingFrequency: BillingFrequency;
  };
  pricing: PlanPricingFrequency;
  orderId: string;
  createdAt: string;
}
