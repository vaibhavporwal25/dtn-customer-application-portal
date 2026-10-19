import React from 'react';
import { FormDataState, ApplicantCategory, ResidentialOccupancy } from '../../types/index.js';
import { User, Building2, Phone, Mail, Calendar, HelpCircle, ShieldCheck } from 'lucide-react';

interface Step1Props {
  formData: FormDataState;
  onChange: (fields: Partial<FormDataState>) => void;
  errors: Record<string, string>;
}

const CATEGORIES: { label: string; value: ApplicantCategory; isOrg?: boolean }[] = [
  { label: 'Residential', value: 'Residential' },
  { label: 'SME (Small & Medium Business)', value: 'SME', isOrg: true },
  { label: 'Corporate / Enterprise', value: 'Corporate', isOrg: true },
  { label: 'Wholesale Carrier', value: 'Wholesale', isOrg: true },
  { label: 'Non-Governmental Org (NGO)', value: 'NGO', isOrg: true },
  { label: 'Educational Institution', value: 'Educational Institution', isOrg: true },
  { label: 'Government Department', value: 'Government', isOrg: true }
];

export const Step1Applicant: React.FC<Step1Props> = ({ formData, onChange, errors }) => {
  const isResidential = formData.category === 'Residential';
  const isOrganization = !isResidential;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Section 1: Applicant Category */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Category of Applicant <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500">
              Reference 1 from DTN India application form
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = formData.category === cat.value;
            return (
              <label
                key={cat.value}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50/70 text-teal-950 shadow-sm ring-1 ring-teal-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="applicant_category"
                  value={cat.value}
                  checked={isSelected}
                  onChange={() => {
                    onChange({
                      category: cat.value,
                      occupancyStatus: cat.value === 'Residential' ? (formData.occupancyStatus || 'Owner') : undefined
                    });
                  }}
                  className="w-4 h-4 text-teal-700 focus:ring-teal-600 border-slate-300"
                />
                <span className="leading-snug">{cat.label}</span>
              </label>
            );
          })}
        </div>

        {/* Conditional Residential: Owner / Tenant */}
        {isResidential && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 animate-in fade-in duration-200">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Residential Occupancy Status <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {(['Owner', 'Tenant'] as ResidentialOccupancy[]).map((occ) => (
                <label
                  key={occ}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    formData.occupancyStatus === occ
                      ? 'border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="residential_occupancy"
                    value={occ}
                    checked={formData.occupancyStatus === occ}
                    onChange={() => onChange({ occupancyStatus: occ })}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <span>{occ}</span>
                </label>
              ))}
            </div>
            {errors.occupancyStatus && (
              <p className="text-xs text-red-600 font-medium mt-1">{errors.occupancyStatus}</p>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Name & Identity Details */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              2. Applicant & Identity Information <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500">
              References 2, 3, & 4 from DTN India application form
            </p>
          </div>
        </div>

        {/* Organizational Conditional Fields */}
        {isOrganization && (
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Organization / Company Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Tech Solutions Pvt. Ltd."
                  value={formData.orgName || ''}
                  onChange={(e) => onChange({ orgName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
                {errors.orgName && <p className="text-xs text-red-600 font-medium mt-1">{errors.orgName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Authorized Signatory / Representative Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Director / Authorized Officer"
                  value={formData.orgRepresentative || ''}
                  onChange={(e) => onChange({ orgRepresentative: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
                {errors.orgRepresentative && <p className="text-xs text-red-600 font-medium mt-1">{errors.orgRepresentative}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Representative Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Managing Director, IT Manager, Principal, Secretary"
                  value={formData.orgDesignation || ''}
                  onChange={(e) => onChange({ orgDesignation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Title and Name */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.applicantTitle}
              onChange={(e) => onChange({ applicantTitle: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
              <option value="M/s">M/s (Firm)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Full Name of Applicant {isOrganization ? '(Contact Person)' : ''} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="First and last name (in BLOCK LETTERS as on ID proof)"
              value={formData.applicantName}
              onChange={(e) => onChange({ applicantName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
            {errors.applicantName && <p className="text-xs text-red-600 font-medium mt-1">{errors.applicantName}</p>}
          </div>
        </div>

        {/* Date of Birth & Gender (primarily for individual/residential) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Date of Birth {!isOrganization && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dob}
                onChange={(e) => onChange({ dob: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
            {errors.dob && <p className="text-xs text-red-600 font-medium mt-1">{errors.dob}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => onChange({ gender: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Existing Customer Status */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              3. Existing Customer Status
            </h3>
            <p className="text-xs text-slate-500">
              Reference 8 from DTN India application form
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            Are you an existing customer of DTN India?
          </label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              !formData.existingCustomer ? 'border-teal-700 bg-teal-50 text-teal-950 ring-1 ring-teal-700' : 'border-slate-200 bg-white text-slate-700'
            }`}>
              <input
                type="radio"
                name="is_existing"
                checked={!formData.existingCustomer}
                onChange={() => onChange({ existingCustomer: false, consumerNumber: '' })}
                className="w-4 h-4 text-teal-700 focus:ring-teal-600"
              />
              <span>No, I am a New Customer</span>
            </label>

            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              formData.existingCustomer ? 'border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-600' : 'border-slate-200 bg-white text-slate-700'
            }`}>
              <input
                type="radio"
                name="is_existing"
                checked={formData.existingCustomer}
                onChange={() => onChange({ existingCustomer: true })}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span>Yes, Existing DTN Customer</span>
            </label>
          </div>

          {/* Conditional Existing Consumer Number */}
          {formData.existingCustomer && (
            <div className="mt-3 p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Existing Consumer Number / Account ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DTN-CONS-49210"
                value={formData.consumerNumber || ''}
                onChange={(e) => onChange({ consumerNumber: e.target.value })}
                className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              {errors.consumerNumber && <p className="text-xs text-red-600 font-medium mt-1">{errors.consumerNumber}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Contact Information */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              4. Contact Information <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500">
              References 12 & 14 from DTN India application form
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Primary Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-600">
              <span className="inline-flex items-center px-3 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-700 select-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9810114338"
                value={formData.contactNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  onChange({ contactNumber: val });
                }}
                className="w-full px-3.5 py-2.5 text-sm focus:outline-none bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">10-digit Indian mobile number for installation updates</p>
            {errors.contactNumber && <p className="text-xs text-red-600 font-medium mt-1">{errors.contactNumber}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Contact Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.contactEmail}
                onChange={(e) => onChange({ contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">For digital invoice receipts and connection notifications</p>
            {errors.contactEmail && <p className="text-xs text-red-600 font-medium mt-1">{errors.contactEmail}</p>}
          </div>
        </div>
      </div>

    </div>
  );
};
