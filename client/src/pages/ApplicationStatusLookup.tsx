import React, { useState } from 'react';
import { fetchApplicationDetails } from '../services/api.js';
import { Search, ShieldCheck, CheckCircle2, Clock, AlertCircle, MapPin, Wifi, FileText, ArrowRight, Printer } from 'lucide-react';

interface LookupProps {
  initialAppId?: string;
  onApplyNew: () => void;
}

export const ApplicationStatusLookup: React.FC<LookupProps> = ({ initialAppId, onApplyNew }) => {
  const [searchId, setSearchId] = useState(initialAppId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialAppId) {
      handleSearch(initialAppId);
    }
  }, [initialAppId]);

  const handleSearch = async (queryId?: string) => {
    const idToSearch = (queryId || searchId).trim();
    if (!idToSearch) {
      setErrorMsg('Please enter an Application ID (e.g. DTN-2026-000101)');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await fetchApplicationDetails(idToSearch);
      setApplication(data);
    } catch (err) {
      setApplication(null);
      setErrorMsg(err instanceof Error ? err.message : 'Application not found');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold uppercase tracking-wide">
            <Search className="w-3.5 h-3.5 text-teal-700" />
            <span>DTN India Application Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Track Application & Connection Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your unique Application ID to check your installation progress and payment status.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter Application ID (e.g. DTN-2026-000101)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Check Status</span>
              )}
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium mt-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}
        </div>

        {/* Application Details Card */}
        {application && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in duration-300 space-y-6 p-6">
            
            {/* Top Bar with Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Application Reference
                </span>
                <h3 className="text-xl font-black text-slate-900 font-mono tracking-wider">
                  {application.applicationId}
                </h3>
                <span className="text-xs text-slate-500">
                  Submitted on {new Date(application.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Application Status Badge */}
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  application.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : application.status === 'Under Review'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : application.status === 'Rejected'
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-teal-50 text-teal-800 border-teal-300'
                }`}>
                  Status: {application.status}
                </span>

                {/* Payment Status Badge */}
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  application.paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : application.paymentStatus === 'Failed'
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  Payment: {application.paymentStatus}
                </span>
              </div>
            </div>

            {/* Applicant & Connection Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block uppercase tracking-wide text-teal-900">
                  Applicant Information
                </span>
                <div>
                  <span className="text-slate-400">Name:</span>{' '}
                  <strong className="text-slate-900">{application.applicantTitle} {application.applicantName}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Category:</span>{' '}
                  <span className="text-slate-800">{application.category} {application.occupancyStatus ? `(${application.occupancyStatus})` : ''}</span>
                </div>
                {application.orgName && (
                  <div>
                    <span className="text-slate-400">Organization:</span>{' '}
                    <strong className="text-slate-900">{application.orgName}</strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Contact:</span>{' '}
                  <span className="text-slate-800">+91 {application.contactNumber} • {application.contactEmail}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 block uppercase tracking-wide text-teal-900">
                  Connection Address
                </span>
                {application.connectionAddress ? (
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {application.connectionAddress.line1}
                    {application.connectionAddress.line2 && <>, {application.connectionAddress.line2}</>}
                    <br />
                    {application.connectionAddress.area}, {application.connectionAddress.city}
                    <br />
                    {application.connectionAddress.state} — <strong>{application.connectionAddress.pincode}</strong>
                  </p>
                ) : (
                  <p className="text-slate-400">Address recorded</p>
                )}
              </div>
            </div>

            {/* Plan Snapshot */}
            {application.pricing && (
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-teal-900 text-sm block">
                    {application.pricing.planName} ({application.pricing.speedMbps} Mbps)
                  </span>
                  <span className="text-slate-500">
                    Billing Frequency: <strong>{application.pricing.billingFrequency}</strong> • {application.pricing.dataAllowance}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block">Total Amount</span>
                  <span className="text-xl font-black text-teal-950">
                    ₹{application.pricing.totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Status Slip</span>
              </button>

              <button
                type="button"
                onClick={onApplyNew}
                className="px-4 py-2 text-teal-800 hover:underline text-xs font-bold flex items-center gap-1"
              >
                <span>Submit Another Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
