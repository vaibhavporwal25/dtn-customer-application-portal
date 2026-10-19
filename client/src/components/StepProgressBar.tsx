import React from 'react';
import { User, MapPin, Wifi, UploadCloud, CheckSquare, CreditCard, Check } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
  maxVisitedStep: number;
}

const steps = [
  { id: 1, label: 'Applicant Details', icon: User, short: 'Applicant' },
  { id: 2, label: 'Address Details', icon: MapPin, short: 'Address' },
  { id: 3, label: 'Plan & Billing', icon: Wifi, short: 'Plan' },
  { id: 4, label: 'Document Uploads', icon: UploadCloud, short: 'Documents' },
  { id: 5, label: 'Review & Terms', icon: CheckSquare, short: 'Review' },
  { id: 6, label: 'Payment', icon: CreditCard, short: 'Payment' }
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onStepClick,
  maxVisitedStep
}) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-5 mb-8">
      {/* Mobile view progress indicator */}
      <div className="sm:hidden flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center">
            {currentStep}
          </span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Step {currentStep} of 6: {steps[currentStep - 1]?.short}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
          {Math.round((currentStep / 6) * 100)}% Complete
        </span>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4 sm:mb-6">
        <div 
          className="bg-gradient-to-r from-teal-700 via-teal-600 to-amber-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Step Nodes (Desktop & Tablet) */}
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id <= maxVisitedStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`flex flex-col items-center text-center group transition-all p-1 sm:p-2 rounded-xl ${
                isClickable ? 'cursor-pointer hover:bg-slate-50' : 'cursor-not-allowed opacity-50'
              }`}
            >
              {/* Icon Circle */}
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1.5 transition-all text-xs font-bold ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                    : isCurrent
                    ? 'bg-[#0e272b] text-amber-400 shadow-md ring-4 ring-amber-400/30'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}
              </div>

              {/* Step Title */}
              <span
                className={`text-[10px] sm:text-xs font-semibold leading-tight line-clamp-1 ${
                  isCurrent
                    ? 'text-teal-900 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
