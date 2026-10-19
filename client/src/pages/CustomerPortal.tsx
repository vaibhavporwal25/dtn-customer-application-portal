import React, { useState, useEffect } from 'react';
import { FormDataState, PlanItem, SubmissionResponse } from '../types/index.js';
import { fetchPlans, submitApplicationApi } from '../services/api.js';
import { StepProgressBar } from '../components/StepProgressBar.js';
import { Step1Applicant } from '../components/steps/Step1Applicant.js';
import { Step2Address } from '../components/steps/Step2Address.js';
import { Step3Plan } from '../components/steps/Step3Plan.js';
import { Step4Documents } from '../components/steps/Step4Documents.js';
import { Step5Review } from '../components/steps/Step5Review.js';
import { Step6Payment } from '../components/steps/Step6Payment.js';
import { ArrowLeft, ArrowRight, ShieldCheck, PhoneCall } from 'lucide-react';

interface CustomerPortalProps {
  onTrackApplication: (appId: string) => void;
}

const INITIAL_FORM_STATE: FormDataState = {
  category: 'Residential',
  occupancyStatus: 'Owner',
  applicantTitle: 'Mr.',
  applicantName: '',
  orgName: '',
  orgRepresentative: '',
  orgDesignation: '',
  dob: '',
  gender: '',
  existingCustomer: false,
  consumerNumber: '',
  contactNumber: '',
  contactEmail: '',
  connectionAddress: {
    line1: '',
    line2: '',
    area: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: ''
  },
  permanentAddress: {
    line1: '',
    line2: '',
    area: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: ''
  },
  sameAsConnectionAddress: true,
  planId: null,
  billingFrequency: 'Monthly',
  photographDoc: null,
  identityProofDoc: null,
  identityDocType: 'Income Tax PAN Card',
  addressProofDoc: null,
  addressDocType: 'Electricity / Power Utility Bill',
  orgProofDoc: null,
  orgDocType: 'GST Registration Certificate (GSTIN)',
  declarationAccepted: false,
  notes: ''
};

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onTrackApplication }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM_STATE);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);

  // Fetch demonstration plans
  useEffect(() => {
    async function load() {
      try {
        setIsLoadingPlans(true);
        const data = await fetchPlans();
        setPlans(data);
        if (data.length > 0 && !formData.planId) {
          // Default select the 2nd plan (150 Mbps - Most Popular)
          const defaultPlan = data[1] || data[0];
          setFormData((prev) => ({ ...prev, planId: defaultPlan.id }));
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    load();
  }, []);

  const updateFormData = (fields: Partial<FormDataState>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    // Clear relevant errors
    setErrors((prev) => {
      const nextErrors = { ...prev };
      Object.keys(fields).forEach((k) => delete nextErrors[k]);
      return nextErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.applicantName.trim()) {
        errs.applicantName = 'Please enter the full applicant name.';
      }
      if (formData.category === 'Residential' && !formData.occupancyStatus) {
        errs.occupancyStatus = 'Please select whether you are Owner or Tenant.';
      }
      const orgCategories = ['SME', 'Corporate', 'Wholesale', 'NGO', 'Educational Institution', 'Government'];
      if (orgCategories.includes(formData.category)) {
        if (!formData.orgName?.trim()) errs.orgName = 'Organization legal name is required.';
        if (!formData.orgRepresentative?.trim()) errs.orgRepresentative = 'Authorized representative name is required.';
      }
      const phoneDigits = formData.contactNumber.replace(/[^0-9]/g, '');
      if (phoneDigits.length !== 10) {
        errs.contactNumber = 'Enter a valid 10-digit Indian mobile number.';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.contactEmail.trim() || !emailRegex.test(formData.contactEmail)) {
        errs.contactEmail = 'Enter a valid contact email address.';
      }
      if (formData.existingCustomer && !formData.consumerNumber?.trim()) {
        errs.consumerNumber = 'Please enter your existing DTN Consumer Number.';
      }
    }

    if (step === 2) {
      const c = formData.connectionAddress;
      if (!c.line1.trim()) errs.connLine1 = 'Line 1 address is required.';
      if (!c.area.trim()) errs.connArea = 'Area / locality is required.';
      if (!c.city.trim()) errs.connCity = 'City is required.';
      if (!c.state.trim()) errs.connState = 'Please select a State.';
      if (!/^[1-9][0-9]{5}$/.test(c.pincode.trim())) {
        errs.connPin = 'Enter a valid 6-digit Indian PIN code.';
      }

      if (!formData.sameAsConnectionAddress) {
        const p = formData.permanentAddress;
        if (!p.line1.trim()) errs.permLine1 = 'Permanent Line 1 address is required.';
        if (!p.area.trim()) errs.permArea = 'Permanent area / locality is required.';
        if (!p.city.trim()) errs.permCity = 'Permanent city is required.';
        if (!p.state.trim()) errs.permState = 'Please select permanent State.';
        if (!/^[1-9][0-9]{5}$/.test(p.pincode.trim())) {
          errs.permPin = 'Enter a valid 6-digit PIN code.';
        }
      }
    }

    if (step === 3) {
      if (!formData.planId) {
        errs.planId = 'Please select an internet plan.';
      }
    }

    if (step === 4) {
      if (!formData.photographDoc) {
        errs.photographDoc = 'Applicant photograph upload is required.';
      }
      if (!formData.identityProofDoc) {
        errs.identityProofDoc = 'Proof of Identity (PoI) upload is required.';
      }
      if (!formData.addressProofDoc) {
        errs.addressProofDoc = 'Proof of Address (PoA) upload is required.';
      }
      if (formData.category !== 'Residential' && !formData.orgProofDoc) {
        errs.orgProofDoc = 'Organization registration document upload is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep > maxVisitedStep) {
        setMaxVisitedStep(nextStep);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep > currentStep) {
      // Validate current before jumping forward
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.declarationAccepted) {
      setSubmitError('You must review and accept the DTN India broadband service declaration.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const res = await submitApplicationApi(formData);
      setSubmissionResult(res);
      setCurrentStep(6);
      setMaxVisitedStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Title Section matching DTN Reference */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Digital Telco Network India Pvt. Ltd.</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            DTN INDIA — NEW CONNECTION APPLICATION
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Apply for your DTN India high-speed optical fibre internet connection online in minutes.
          </p>
          <p className="text-[11px] text-slate-400 italic">
            Demonstration Portal — Physical application form digitized for prototype review.
          </p>
        </div>

        {/* Step Progress Bar */}
        <StepProgressBar
          currentStep={currentStep}
          totalSteps={6}
          onStepClick={handleStepClick}
          maxVisitedStep={maxVisitedStep}
        />

        {/* Form Steps */}
        <div className="mb-8">
          {currentStep === 1 && (
            <Step1Applicant
              formData={formData}
              onChange={updateFormData}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <Step2Address
              formData={formData}
              onChange={updateFormData}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <Step3Plan
              formData={formData}
              plans={plans}
              onChange={updateFormData}
              errors={errors}
              isLoadingPlans={isLoadingPlans}
            />
          )}

          {currentStep === 4 && (
            <Step4Documents
              formData={formData}
              onChange={updateFormData}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <Step5Review
              formData={formData}
              plans={plans}
              onGoToStep={handleStepClick}
              onDeclarationChange={(accepted) => updateFormData({ declarationAccepted: accepted })}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              error={submitError}
            />
          )}

          {currentStep === 6 && submissionResult && (
            <Step6Payment
              submission={submissionResult}
              onTrackApplication={onTrackApplication}
            />
          )}
        </div>

        {/* Step Navigation Buttons (Steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrevious}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                currentStep > 1
                  ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer'
                  : 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 sm:px-8 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
