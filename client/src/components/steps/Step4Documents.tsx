import React, { useState } from 'react';
import { FormDataState, UploadedDocInfo } from '../../types/index.js';
import { uploadDocumentFile, deleteDocumentFile, getDocumentPreviewUrl } from '../../services/api.js';
import { UploadCloud, CheckCircle, Trash2, FileText, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';

interface Step4Props {
  formData: FormDataState;
  onChange: (fields: Partial<FormDataState>) => void;
  errors: Record<string, string>;
}

const IDENTITY_DOC_OPTIONS = [
  'Income Tax PAN Card',
  'Aadhaar Card (Govt of India)',
  'Voter ID Card (Election Commission)',
  'Passport',
  'Driving Licence',
  'Government / PSU Issued Identity Card',
  'Photo Credit Card',
  'University / College Identity Card'
];

const ADDRESS_DOC_OPTIONS = [
  'Electricity / Power Utility Bill',
  'Aadhaar Card (Registered Address)',
  'Registered Rent Agreement / Lease Deed',
  'Water / Municipal Utility Bill',
  'Bank Account Statement / Passbook',
  'Passport (Address Page)',
  'Property Tax / Landline Bill'
];

const ORG_DOC_OPTIONS = [
  'GST Registration Certificate (GSTIN)',
  'Certificate of Incorporation (MCA / RoC)',
  'Partnership Deed / Trust Registration',
  'Board Resolution / Authorization Letter',
  'Udyam / MSME Registration Certificate'
];

interface UploadSlotProps {
  title: string;
  subtitle: string;
  required?: boolean;
  doc: UploadedDocInfo | null;
  documentType: string;
  docLabel: string;
  onDocUploaded: (doc: UploadedDocInfo) => void;
  onDocRemoved: () => void;
  error?: string;
  accept: string;
  options?: string[];
  selectedOption?: string;
  onOptionChange?: (val: string) => void;
}

const UploadSlot: React.FC<UploadSlotProps> = ({
  title,
  subtitle,
  required,
  doc,
  documentType,
  docLabel,
  onDocUploaded,
  onDocRemoved,
  error,
  accept,
  options,
  selectedOption,
  onOptionChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setUploadError(null);

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5 MB limit.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadDocumentFile(file, documentType, selectedOption || docLabel);
      onDocUploaded(res);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (!doc) return;
    try {
      await deleteDocumentFile(doc.id);
    } catch (e) {
      console.warn('Could not delete from server:', e);
    }
    onDocRemoved();
  };

  const isImage = doc && (doc.mimeType.includes('image') || doc.originalFilename.match(/\.(jpg|jpeg|png)$/i));

  return (
    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            {title} {required && <span className="text-red-500">*</span>}
          </h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        {options && onOptionChange && (
          <div className="sm:w-64">
            <select
              value={selectedOption}
              onChange={(e) => onOptionChange(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {doc ? (
        <div className="p-4 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            {isImage ? (
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={getDocumentPreviewUrl(doc.id)}
                  alt="Document Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 text-red-600 shrink-0 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            )}

            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {doc.originalFilename}
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <span className="text-[11px] text-slate-400 block">
                {(doc.fileSize / 1024).toFixed(1)} KB • {doc.docLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors" title="Replace File">
              <RefreshCw className="w-4 h-4" />
              <input
                type="file"
                accept={accept}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            isDragging
              ? 'border-teal-600 bg-teal-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-600">Uploading & verifying file signature...</span>
            </div>
          ) : (
            <div>
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs text-slate-600 font-medium">
                <label className="text-teal-700 hover:text-teal-800 font-bold cursor-pointer hover:underline">
                  Click to browse
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>{' '}
                or drag and drop your document here
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported formats: JPG, PNG, PDF (Max size: 5 MB)
              </p>
            </div>
          )}
        </div>
      )}

      {(uploadError || error) && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError || error}</span>
        </p>
      )}
    </div>
  );
};

export const Step4Documents: React.FC<Step4Props> = ({ formData, onChange, errors }) => {
  const isOrganization = formData.category !== 'Residential';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
        <h3 className="text-base font-bold text-slate-900">
          Document Uploads & KYC Verification
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Reference 23 from DTN India application form. In accordance with Department of Telecommunications (DoT) guidelines, please attach mandatory identity and address verification documents. All files are securely sandboxed and encrypted at rest.
        </p>
      </div>

      {/* 1. Photograph */}
      <UploadSlot
        title="1. Applicant Photograph"
        subtitle="Recent passport-size colored photograph of the applicant"
        required
        doc={formData.photographDoc}
        documentType="photograph"
        docLabel="Applicant Photograph"
        onDocUploaded={(doc) => onChange({ photographDoc: doc })}
        onDocRemoved={() => onChange({ photographDoc: null })}
        error={errors.photographDoc}
        accept=".jpg,.jpeg,.png"
      />

      {/* 2. Identity Proof */}
      <UploadSlot
        title="2. Proof of Identity (PoI)"
        subtitle="Government issued photo identification document"
        required
        doc={formData.identityProofDoc}
        documentType="identity_proof"
        docLabel={formData.identityDocType || IDENTITY_DOC_OPTIONS[0]}
        options={IDENTITY_DOC_OPTIONS}
        selectedOption={formData.identityDocType || IDENTITY_DOC_OPTIONS[0]}
        onOptionChange={(val) => onChange({ identityDocType: val })}
        onDocUploaded={(doc) => onChange({ identityProofDoc: doc })}
        onDocRemoved={() => onChange({ identityProofDoc: null })}
        error={errors.identityProofDoc}
        accept=".jpg,.jpeg,.png,.pdf"
      />

      {/* 3. Address Proof */}
      <UploadSlot
        title="3. Proof of Address (PoA)"
        subtitle="Valid document verifying the connection / correspondence location"
        required
        doc={formData.addressProofDoc}
        documentType="address_proof"
        docLabel={formData.addressDocType || ADDRESS_DOC_OPTIONS[0]}
        options={ADDRESS_DOC_OPTIONS}
        selectedOption={formData.addressDocType || ADDRESS_DOC_OPTIONS[0]}
        onOptionChange={(val) => onChange({ addressDocType: val })}
        onDocUploaded={(doc) => onChange({ addressProofDoc: doc })}
        onDocRemoved={() => onChange({ addressProofDoc: null })}
        error={errors.addressProofDoc}
        accept=".jpg,.jpeg,.png,.pdf"
      />

      {/* 4. Organization Supporting Document (if applicable) */}
      {isOrganization && (
        <UploadSlot
          title="4. Organization / Business Registration Proof"
          subtitle="Certificate of Incorporation, GSTIN, or Board Authorization Letter"
          required
          doc={formData.orgProofDoc}
          documentType="org_proof"
          docLabel={formData.orgDocType || ORG_DOC_OPTIONS[0]}
          options={ORG_DOC_OPTIONS}
          selectedOption={formData.orgDocType || ORG_DOC_OPTIONS[0]}
          onOptionChange={(val) => onChange({ orgDocType: val })}
          onDocUploaded={(doc) => onChange({ orgProofDoc: doc })}
          onDocRemoved={() => onChange({ orgProofDoc: null })}
          error={errors.orgProofDoc}
          accept=".jpg,.jpeg,.png,.pdf"
        />
      )}

    </div>
  );
};
