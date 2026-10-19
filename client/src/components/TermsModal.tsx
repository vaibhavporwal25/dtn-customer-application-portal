import React from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  accepted?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept, accepted }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0e272b] text-white px-6 py-4 flex items-center justify-between border-b border-teal-800">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              Digital Telco Network India Pvt. Ltd.
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Broadband Internet Service Terms & Conditions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-xs text-slate-600 space-y-4 leading-relaxed">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Demonstration Disclaimer:</strong> The following terms reflect the clauses on DTN India's physical application form (Reference 22). These terms are presented for demonstration and prototype evaluation until officially approved by DTN India management.
            </div>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            <div className="pt-2">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1">
                1. Acceptance & Feasibility
              </h5>
              <p>
                Provision of Broadband & Telecom Services is subject to acceptance of the application and technical feasibility. DTN India will endeavor to provide the Broadband Service as soon as technically feasible. A demand note may be issued to the customer for depositing charges payable as per the chosen tariff plan before commencement of service.
              </p>
            </div>

            <div className="pt-3">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1">
                2. Contract Period & Minimum Commitment
              </h5>
              <p>
                The contract with DTN INDIA for provision of Broadband Service will be for a minimum period from the date of commencement depending upon the billing frequency chosen (Monthly, Quarterly, Half-Yearly, or Annual).
              </p>
            </div>

            <div className="pt-3">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1">
                3. Bandwidth & IP Assignment
              </h5>
              <p>
                The data rates shown as download or upload speed are applicable up to the last mile network. All IP address allocations are dynamic unless a dedicated static IP is contracted separately under an enterprise agreement.
              </p>
            </div>

            <div className="pt-3">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1">
                4. Statutory Compliance & Lawful Use
              </h5>
              <p>
                The subscriber is required to strictly comply with the provisions contained in the Indian Telegraph Act 1885, Indian Telegraph Rules, and the Information Technology Act 2000, and any amendments thereto. The subscriber shall not use this network for any illegal or unauthorized purpose. As informed by DTN India, this network is used for Voice, Video & Data services so hereby the subscriber follows all rules & regulations given by the Department of Telecommunications (DoT).
              </p>
            </div>

            <div className="pt-3">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1">
                5. Billing & Payment Terms
              </h5>
              <p>
                All billing is done in advance as per plan chosen. Payment must be made on or before the due date. DTN India reserves the right to disconnect service in case of default or non-payment of bills issued.
              </p>
            </div>

            <div className="pt-3">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1">
                6. Service Termination & Disclaimer
              </h5>
              <p>
                DTN INDIA reserves the right to disconnect service if there is sufficient evidence of the customer intentionally or unintentionally using the service in a manner that adversely impacts DTN INDIA's network infrastructure. DTN INDIA exercises all reasonable care in providing service but is not responsible for interruption in service due to power failures, fiber cuts beyond control, natural calamities, or equipment malfunction on subscriber premises.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{accepted ? 'Terms Accepted' : 'Accept Terms & Close'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
