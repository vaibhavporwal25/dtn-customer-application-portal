import React, { useState } from 'react';
import { SubmissionResponse, PaymentStatus } from '../../types/index.js';
import { simulatePaymentApi } from '../../services/api.js';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Printer,
  Smartphone,
  Building,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';

interface Step6Props {
  submission: SubmissionResponse;
  onTrackApplication: (appId: string) => void;
}

export const Step6Payment: React.FC<Step6Props> = ({ submission, onTrackApplication }) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(submission.paymentStatus || 'Pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'NetBanking' | 'Card'>('UPI');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger celebration confetti on initial view
  React.useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  }, []);

  const handleSimulate = async (outcome: 'SUCCESS' | 'FAILURE' | 'CANCEL') => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const res = await simulatePaymentApi(submission.orderId, outcome, selectedMethod);
      setPaymentResult(res);

      if (outcome === 'SUCCESS') {
        setPaymentStatus('Paid');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      } else if (outcome === 'FAILURE') {
        setPaymentStatus('Failed');
      } else if (outcome === 'CANCEL') {
        setPaymentStatus('Cancelled');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Success Submission Header */}
      <div className="bg-gradient-to-r from-teal-900 to-[#0e272b] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-800 text-center relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Application Successfully Submitted!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
          Your customer connection application has been saved to the permanent database. Your unique reference number is:
        </p>
        
        {/* Application ID Pill */}
        <div className="mt-4 inline-block bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-amber-400/40 text-amber-300 font-mono text-xl sm:text-2xl font-black tracking-widest shadow-inner">
          {submission.applicationId}
        </div>

        <div className="mt-3 text-[11px] text-slate-400">
          Registered in the name of <strong>{submission.applicantName}</strong> ({submission.category})
        </div>
      </div>

      {/* Payment Summary Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Demo Mode Alert Banner */}
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <h5 className="font-extrabold text-sm uppercase tracking-wider text-amber-950 mb-0.5">
              DEMO MODE — NO REAL MONEY WILL BE CHARGED
            </h5>
            <p className="leading-relaxed">
              This simulated payment terminal allows testing the complete customer onboarding flow. You can simulate transaction success, failure, or cancellation to test error handling and status updates.
            </p>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                Invoice Order ID: {submission.orderId}
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {submission.plan.name} ({submission.plan.speedMbps} Mbps)
              </h4>
              <p className="text-xs text-slate-500">
                Billing Frequency: {submission.plan.billingFrequency}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Total Payable Amount</span>
              <div className="text-2xl font-black text-slate-950">
                ₹{submission.pricing.totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
            <div>Base: ₹{submission.pricing.basePriceRupees.toLocaleString('en-IN')}</div>
            <div>GST (18%): ₹{submission.pricing.taxRupees.toLocaleString('en-IN')}</div>
            <div>Install: {submission.pricing.installationRupees === 0 ? 'FREE' : `₹${submission.pricing.installationRupees}`}</div>
            <div className="font-bold text-teal-800">Payment Status: {paymentStatus}</div>
          </div>
        </div>

        {/* Payment Outcome Display */}
        {paymentStatus === 'Paid' ? (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-emerald-900">Payment Received & Verified</h4>
              <p className="text-xs text-emerald-700 mt-1">
                Transaction ID: <strong>{paymentResult?.paymentId || 'PAY_SIM_COMPLETED'}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Your payment of ₹{submission.pricing.totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })} was recorded in the database. DTN India network team will initiate field verification.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Application Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => onTrackApplication(submission.applicationId)}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Track Application in Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : paymentStatus === 'Failed' ? (
          <div className="p-6 bg-red-50 border-2 border-red-300 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-900">Simulated Payment Failed</h4>
              <p className="text-xs text-red-700 mt-1">
                Reason: Bank gateway simulated timeout / authorization declined.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Notice: Your application record remains safe in the database with Application ID: <strong>{submission.applicationId}</strong>. You do NOT need to fill the form again.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('Pending')}
                className="px-6 py-2.5 bg-[#d92626] hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto transition-colors shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Payment Attempt</span>
              </button>
            </div>
          </div>
        ) : paymentStatus === 'Cancelled' ? (
          <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-amber-900">Simulated Payment Cancelled</h4>
              <p className="text-xs text-amber-700 mt-1">
                The checkout session was cancelled by the user.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('Pending')}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto transition-colors shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resume Payment</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pending state: Test Simulation Options */
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Select Simulated Payment Instrument
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'NetBanking', label: 'NetBanking', icon: Building, desc: 'SBI, HDFC, ICICI, Axis' },
                  { id: 'Card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa, MasterCard, RuPay' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedMethod === item.id
                        ? 'border-teal-700 bg-teal-50 text-slate-900 ring-2 ring-teal-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_inst"
                      checked={selectedMethod === item.id}
                      onChange={() => setSelectedMethod(item.id as any)}
                      className="w-4 h-4 text-teal-700 focus:ring-teal-600 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Test Simulation Action Triggers */}
            <div className="p-5 bg-slate-100 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Demonstrator Simulation Actions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSimulate('SUCCESS')}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Success</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSimulate('FAILURE')}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Simulate Failure</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSimulate('CANCEL')}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Simulate Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
