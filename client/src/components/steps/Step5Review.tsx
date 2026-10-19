import React, { useState } from 'react';
import { FormDataState, PlanItem } from '../../types/index.js';
import { TermsModal } from '../TermsModal.js';
import { User, MapPin, Wifi, FileCheck, Edit3, ShieldAlert, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

interface Step5Props {
  formData: FormDataState;
  plans: PlanItem[];
  onGoToStep: (step: number) => void;
  onDeclarationChange: (accepted: boolean) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  error?: string | null;
}

export const Step5Review: React.FC<Step5Props> = ({
  formData,
  plans,
  onGoToStep,
  onDeclarationChange,
  isSubmitting,
  onSubmit,
  error
}) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const selectedPlan = plans.find((p) => p.id === formData.planId) || null;
  const pricing = selectedPlan ? selectedPlan.frequencies[formData.billingFrequency] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Intro Alert */}
      <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong>Review Your Application:</strong> Please carefully review all entered details and uploaded documents before submission. You can click <strong>"Edit"</strong> on any section to make corrections.
        </div>
      </div>

      {/* 1. Applicant & Identity Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-800" />
            <h4 className="text-sm font-bold text-slate-800">1. Applicant & Category Details</h4>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Applicant Category</span>
            <span className="font-bold text-slate-800 text-sm">{formData.category}</span>
          </div>

          {formData.category === 'Residential' && (
            <div>
              <span className="text-slate-400 block mb-0.5">Occupancy Status</span>
              <span className="font-semibold text-slate-800">{formData.occupancyStatus || 'Owner'}</span>
            </div>
          )}

          {formData.category !== 'Residential' && (
            <>
              <div>
                <span className="text-slate-400 block mb-0.5">Organization Legal Name</span>
                <span className="font-bold text-slate-800">{formData.orgName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Authorized Representative</span>
                <span className="font-semibold text-slate-800">{formData.orgRepresentative || 'N/A'} ({formData.orgDesignation || 'Officer'})</span>
              </div>
            </>
          )}

          <div>
            <span className="text-slate-400 block mb-0.5">Full Name</span>
            <span className="font-bold text-slate-800">{formData.applicantTitle} {formData.applicantName}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Primary Mobile</span>
            <span className="font-semibold text-slate-800">+91 {formData.contactNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Contact Email</span>
            <span className="font-semibold text-slate-800">{formData.contactEmail}</span>
          </div>

          {formData.dob && (
            <div>
              <span className="text-slate-400 block mb-0.5">Date of Birth</span>
              <span className="font-semibold text-slate-800">{formData.dob}</span>
            </div>
          )}

          {formData.gender && (
            <div>
              <span className="text-slate-400 block mb-0.5">Gender</span>
              <span className="font-semibold text-slate-800">{formData.gender}</span>
            </div>
          )}

          <div>
            <span className="text-slate-400 block mb-0.5">Existing DTN Customer</span>
            <span className="font-semibold text-slate-800">
              {formData.existingCustomer ? `Yes (${formData.consumerNumber || 'Consumer Number Pending'})` : 'No (New Connection)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Addresses */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-800" />
            <h4 className="text-sm font-bold text-slate-800">2. Installation & Permanent Addresses</h4>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide text-teal-900 mb-2">
              Connection / Correspondence Address (Site)
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {formData.connectionAddress.line1}
              {formData.connectionAddress.line2 && <>, {formData.connectionAddress.line2}</>}
              <br />
              {formData.connectionAddress.area}, {formData.connectionAddress.city}
              <br />
              {formData.connectionAddress.state} — <strong>{formData.connectionAddress.pincode}</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide text-amber-900 mb-2">
              Permanent Address {formData.sameAsConnectionAddress && '(Same as Connection)'}
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {formData.permanentAddress.line1}
              {formData.permanentAddress.line2 && <>, {formData.permanentAddress.line2}</>}
              <br />
              {formData.permanentAddress.area}, {formData.permanentAddress.city}
              <br />
              {formData.permanentAddress.state} — <strong>{formData.permanentAddress.pincode}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Selected Plan & Pricing Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-teal-800" />
            <h4 className="text-sm font-bold text-slate-800">3. Internet Plan & Tariffs</h4>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {selectedPlan && pricing && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  {selectedPlan.code} • {formData.billingFrequency} Billing
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  {selectedPlan.name} ({selectedPlan.speedMbps} Mbps)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPlan.dataAllowance}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Payable</span>
                <div className="text-2xl font-black text-teal-900">
                  ₹{pricing.totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Base Plan Rate</span>
                <span className="font-bold text-slate-800">₹{pricing.basePriceRupees.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">GST (18%)</span>
                <span className="font-bold text-slate-800">₹{pricing.taxRupees.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Installation</span>
                <span className="font-bold text-slate-800">{pricing.installationRupees === 0 ? 'FREE' : `₹${pricing.installationRupees}`}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Currency</span>
                <span className="font-bold text-slate-800">INR (₹)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Uploaded Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-teal-800" />
            <h4 className="text-sm font-bold text-slate-800">4. Attached Supporting Documents</h4>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Applicant Photograph', doc: formData.photographDoc },
            { label: 'Identity Proof', doc: formData.identityProofDoc },
            { label: 'Address Proof', doc: formData.addressProofDoc },
            ...(formData.orgProofDoc ? [{ label: 'Organization Proof', doc: formData.orgProofDoc }] : [])
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <FileText className="w-5 h-5 text-teal-700 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                  {item.label}
                </span>
                <span className="font-semibold text-slate-800 truncate block">
                  {item.doc ? item.doc.originalFilename : 'Not Attached'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Self Declaration & Terms (Reference 22) */}
      <div className="bg-white p-6 rounded-2xl border-2 border-teal-800/30 shadow-md space-y-4">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <input
              id="declaration_checkbox"
              type="checkbox"
              checked={formData.declarationAccepted}
              onChange={(e) => onDeclarationChange(e.target.checked)}
              className="w-5 h-5 rounded text-teal-700 focus:ring-teal-600 border-slate-300 cursor-pointer"
            />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <label htmlFor="declaration_checkbox" className="font-bold text-slate-900 cursor-pointer block mb-1">
              Self Declaration & Acceptance of Service Terms <span className="text-red-500">*</span>
            </label>
            <p>
              "I confirm that the information provided in this application is accurate and that I agree to the applicable DTN India broadband internet service terms and conditions."
            </p>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="mt-2 text-teal-800 hover:text-teal-900 font-bold underline inline-flex items-center gap-1 text-xs"
            >
              <span>Click to read full DTN India Service Terms & Conditions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            disabled={!formData.declarationAccepted || isSubmitting}
            onClick={onSubmit}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              formData.declarationAccepted && !isSubmitting
                ? 'bg-[#d92626] hover:bg-[#b91c1c] text-white active:scale-95 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <span>Submit Application & Proceed to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => onDeclarationChange(true)}
        accepted={formData.declarationAccepted}
      />

    </div>
  );
};
