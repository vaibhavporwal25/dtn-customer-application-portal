import React from 'react';
import { FormDataState, PlanItem, BillingFrequency } from '../../types/index.js';
import { Wifi, Zap, CheckCircle2, AlertCircle, Info, Calculator, RefreshCw, Loader2 } from 'lucide-react';

interface Step3Props {
  formData: FormDataState;
  plans: PlanItem[];
  onChange: (fields: Partial<FormDataState>) => void;
  errors: Record<string, string>;
  isLoadingPlans: boolean;
  plansError?: string | null;
  onRetryPlans?: () => void;
}

const FREQUENCIES: { value: BillingFrequency; label: string; badge?: string; desc: string }[] = [
  { value: 'Monthly', label: 'Monthly (1 Month)', desc: 'Standard advance billing' },
  { value: 'Quarterly', label: 'Quarterly (3 Months)', badge: '5% Saved', desc: 'Quarterly advance discount' },
  { value: 'Half-Yearly', label: 'Half-Yearly (6 Months)', badge: '10% Saved + 50% Off Install', desc: 'Best value for homes' },
  { value: 'Annual', label: 'Annual (12 Months)', badge: '20% Saved + FREE Installation', desc: 'Maximum savings & free setup' }
];

export const Step3Plan: React.FC<Step3Props> = ({
  formData,
  plans,
  onChange,
  errors,
  isLoadingPlans,
  plansError,
  onRetryPlans
}) => {
  const selectedPlan = plans.find((p) => p.id === formData.planId) || plans[0] || null;
  const currentPricing = selectedPlan ? selectedPlan.frequencies[formData.billingFrequency] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Demonstration Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">DEMO PLAN NOTICE:</strong> Sample prices, speeds, and tariffs shown below are for prototype demonstration only and do not represent official DTN India commercial offers. Tariffs will be configured to company-approved plans upon production deployment.
        </div>
      </div>

      {/* Section 1: Billing Frequency (Reference 20) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Choose Payment / Billing Frequency <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500">
              Reference 20: Select billing tenure. Longer commitments include tariff discounts and installation waivers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FREQUENCIES.map((freq) => {
            const isSelected = formData.billingFrequency === freq.value;
            return (
              <label
                key={freq.value}
                className={`relative flex flex-col justify-between p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 text-slate-900 shadow-md ring-2 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{freq.label}</span>
                    <input
                      type="radio"
                      name="billing_freq"
                      value={freq.value}
                      checked={isSelected}
                      onChange={() => onChange({ billingFrequency: freq.value })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">{freq.desc}</p>
                </div>
                {freq.badge && (
                  <div className="mt-3">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {freq.badge}
                    </span>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 2: Internet Plan Selection (Reference 21) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              2. Select Internet Plan <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500">
              Reference 21: High-speed optical fibre broadband packages
            </p>
          </div>
        </div>

        {isLoadingPlans ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 py-3 text-teal-800 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
              <span>Fetching available optical fibre plans...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                    <div className="h-4 bg-slate-200 rounded w-16" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-48" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <div className="h-6 bg-slate-200 rounded w-20" />
                    <div className="h-6 bg-slate-200 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : plansError ? (
          <div className="p-6 bg-red-50/90 border border-red-200 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-950">Unable to Load Internet Packages</h4>
              <p className="text-xs text-red-700 mt-1 max-w-lg mx-auto leading-relaxed">
                {plansError}
              </p>
            </div>
            {onRetryPlans && (
              <button
                type="button"
                onClick={onRetryPlans}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Loading Plans</span>
              </button>
            )}
          </div>
        ) : plans.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Internet Plans Available</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active broadband packages returned by the system.
            </p>
            {onRetryPlans && (
              <button
                type="button"
                onClick={onRetryPlans}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Again</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const isSelected = formData.planId === plan.id;
              const pricing = plan.frequencies[formData.billingFrequency];

              return (
                <div
                  key={plan.id}
                  onClick={() => onChange({ planId: plan.id })}
                  className={`relative p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/50 shadow-md ring-2 ring-teal-700'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {plan.code}
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-teal-800">
                        <CheckCircle2 className="w-4 h-4 text-teal-700" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600">
                        Click to Select
                      </span>
                    )}
                  </div>

                  {/* Plan Speed & Name */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-950 tracking-tight">
                        {plan.speedMbps}
                      </span>
                      <span className="text-sm font-bold text-teal-800 uppercase tracking-wide">
                        Mbps Speed
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {plan.dataAllowance}
                    </p>
                  </div>

                  {/* Description & Demo Disclaimer */}
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  {/* Pricing Overview */}
                  <div className="pt-3 border-t border-slate-200/80 mt-auto">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Plan Rate:</span>
                        <div className="text-lg font-extrabold text-slate-900">
                          ₹{pricing.basePriceRupees.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Total with 18% GST:</span>
                        <div className="text-lg font-black text-teal-900">
                          ₹{pricing.totalRupees.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>GST (18%): ₹{pricing.taxRupees.toLocaleString('en-IN')}</span>
                      <span>Install: {pricing.installationRupees > 0 ? `₹${pricing.installationRupees}` : 'FREE'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {errors.planId && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errors.planId}</span>
          </div>
        )}
      </div>

      {/* Section 3: Live Pricing Breakdown Summary */}
      {currentPricing && selectedPlan && (
        <div className="bg-[#0e272b] text-white p-5 sm:p-6 rounded-2xl border border-teal-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-teal-800/80">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm sm:text-base font-bold text-white">
                Live Pricing Breakdown ({formData.billingFrequency})
              </h4>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              {selectedPlan.name} • {selectedPlan.speedMbps} Mbps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#14363d] p-3 rounded-xl border border-teal-700/40">
              <span className="text-slate-400 block mb-1">Base Plan Charge:</span>
              <span className="text-base font-extrabold text-white">
                ₹{currentPricing.basePriceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#14363d] p-3 rounded-xl border border-teal-700/40">
              <span className="text-slate-400 block mb-1">GST ({currentPricing.gstRatePercent}%):</span>
              <span className="text-base font-extrabold text-white">
                ₹{currentPricing.taxRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#14363d] p-3 rounded-xl border border-teal-700/40">
              <span className="text-slate-400 block mb-1">Installation / Setup:</span>
              <span className={`text-base font-extrabold ${currentPricing.installationRupees === 0 ? 'text-emerald-400' : 'text-white'}`}>
                {currentPricing.installationRupees === 0 ? 'FREE (Waived)' : `₹${currentPricing.installationRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-600/30 to-amber-500/20 p-3 rounded-xl border border-amber-500/50">
              <span className="text-amber-300 block mb-1 font-semibold">Total Payable Amount:</span>
              <span className="text-xl font-black text-amber-400">
                ₹{currentPricing.totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
