import React, { useState, useEffect } from 'react';
import {
  adminLoginApi,
  fetchAdminStats,
  fetchAdminApplications,
  fetchAdminApplicationDetail,
  updateApplicationStatusApi,
  getDocumentPreviewUrl,
  getDocumentDownloadUrl,
  getExcelExportUrl,
  downloadExcelExport
} from '../services/api.js';
import {
  LayoutDashboard,
  Lock,
  LogOut,
  Search,
  Filter,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Building,
  User,
  MapPin,
  Wifi,
  CreditCard,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dtn_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(() => {
    const saved = localStorage.getItem('dtn_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form states
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@DTN2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard states
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail Modal
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [appDetail, setAppDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateMsg, setStatusUpdateMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      const res = await adminLoginApi(username, password);
      setToken(res.token);
      setAdminUser(res.admin);
      localStorage.setItem('dtn_admin_token', res.token);
      localStorage.setItem('dtn_admin_user', JSON.stringify(res.admin));
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('dtn_admin_token');
    localStorage.removeItem('dtn_admin_user');
  };

  // Load stats and application list
  const loadDashboardData = async () => {
    if (!token) return;
    try {
      setIsLoadingList(true);
      const [statsData, listData] = await Promise.all([
        fetchAdminStats(token),
        fetchAdminApplications(token, {
          page: pagination.page,
          limit: pagination.limit,
          search,
          category,
          status,
          paymentStatus,
          startDate,
          endDate
        })
      ]);
      setStats(statsData);
      setApplications(listData.data);
      setPagination(listData.pagination);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, pagination.page, category, status, paymentStatus, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadDashboardData();
  };

  const handleOpenDetail = async (id: number) => {
    if (!token) return;
    try {
      setSelectedAppId(id);
      setIsLoadingDetail(true);
      setStatusUpdateMsg(null);
      setStatusNotes('');
      const data = await fetchAdminApplicationDetail(token, id);
      setAppDetail(data);
    } catch (err) {
      console.error('Error loading detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!token || !selectedAppId) return;
    try {
      setIsUpdatingStatus(true);
      await updateApplicationStatusApi(token, selectedAppId, newStatus, statusNotes);
      setStatusUpdateMsg(`Application status updated to "${newStatus}"`);
      // Reload detail and list
      const updated = await fetchAdminApplicationDetail(token, selectedAppId);
      setAppDetail(updated);
      loadDashboardData();
    } catch (err) {
      setStatusUpdateMsg(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExcelExport = async () => {
    if (!token) return;
    try {
      setIsExporting(true);
      await downloadExcelExport(token, {
        search,
        category,
        status,
        paymentStatus,
        startDate,
        endDate
      });
    } catch (err) {
      alert('Excel export error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  // -------------------------------------------------------------
  // Render Login Form if unauthenticated
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#0e272b] rounded-2xl mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              DTN Administrator Login
            </h2>
            <p className="text-xs text-slate-500">
              Digital Telco Network India Pvt. Ltd. Application Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Admin Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Authenticate & Access Dashboard</span>
              )}
            </button>
          </form>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed space-y-1">
            <span className="font-bold text-slate-700 block">Demonstration Credentials:</span>
            <div>Username: <strong className="text-slate-800">admin</strong></div>
            <div>Password: <strong className="text-slate-800">Admin@DTN2026!</strong></div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="bg-[#0e272b] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                DTN INDIA • OPERATIONS CONTROL
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Customer Application Management Dashboard
              </h1>
              <p className="text-xs text-slate-300">
                Logged in as <strong>{adminUser?.fullName || 'Administrator'}</strong> ({adminUser?.role || 'admin'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-teal-700/50"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Total Applications</span>
              <div className="text-2xl font-black text-slate-900">{stats.total}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">All records</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wide block mb-1">Submitted</span>
              <div className="text-2xl font-black text-teal-900">{stats.submitted}</div>
              <span className="text-[10px] text-teal-600 mt-1 block">Awaiting review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide block mb-1">Under Review</span>
              <div className="text-2xl font-black text-amber-800">{stats.underReview}</div>
              <span className="text-[10px] text-amber-600 mt-1 block">KYC in progress</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide block mb-1">Approved</span>
              <div className="text-2xl font-black text-emerald-800">{stats.approved}</div>
              <span className="text-[10px] text-emerald-600 mt-1 block">Ready for install</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide block mb-1">Paid Payments</span>
              <div className="text-2xl font-black text-emerald-700">{stats.paid}</div>
              <span className="text-[10px] text-emerald-600 mt-1 block">Verified fees</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Pending / Failed</span>
              <div className="text-2xl font-black text-slate-700">{stats.pending + stats.failed}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Payment pending</span>
            </div>
          </div>
        )}

        {/* Search, Filter & EXCEL EXPORT Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by ID, Name, Mobile, Email, Org..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
              />
            </form>

            {/* EXCEL EXPORT BUTTON (CORE REQUIREMENT) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExcelExport}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>GENERATING EXCEL...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>EXPORT TO EXCEL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Residential">Residential</option>
                <option value="SME">SME</option>
                <option value="Corporate">Corporate</option>
                <option value="Wholesale">Wholesale</option>
                <option value="NGO">NGO</option>
                <option value="Educational Institution">Educational</option>
                <option value="Government">Government</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Application Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0e272b] text-white border-b border-teal-800">
                  <th className="py-3 px-4 font-bold">App ID</th>
                  <th className="py-3 px-4 font-bold">Applicant / Org</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Contact</th>
                  <th className="py-3 px-4 font-bold">Area / City</th>
                  <th className="py-3 px-4 font-bold">Selected Plan</th>
                  <th className="py-3 px-4 font-bold text-right">Amount (₹)</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Payment</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      Loading submitted applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      No customer applications match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-900">
                        {app.applicationId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="font-bold text-slate-900">{app.applicantTitle} {app.applicantName}</div>
                        {app.orgName && <div className="text-[11px] text-slate-500">{app.orgName}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-[11px]">
                          {app.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>+91 {app.contactNumber}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{app.contactEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>{app.connectionArea}</div>
                        <div className="text-[11px] text-slate-400">{app.connectionCity}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        <div className="font-semibold">{app.planName}</div>
                        <div className="text-[10px] text-slate-400">{app.speedMbps} Mbps • {app.billingFrequency}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        ₹{app.totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          app.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : app.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : app.status === 'Rejected'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-teal-50 text-teal-800 border-teal-300'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          app.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : app.paymentStatus === 'Failed'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {app.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(app.id)}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-lg font-bold text-xs flex items-center gap-1 mx-auto transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-700" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong> ({pagination.total} records total)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Application Detail Modal / Drawer */}
        {/* ======================================================== */}
        {selectedAppId && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-[#0e272b] text-white px-6 py-4 flex items-center justify-between border-b border-teal-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Application Review & Document Verification
                  </span>
                  <h3 className="text-lg font-black text-white font-mono">
                    {appDetail?.application_id || 'Loading...'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAppId(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
                {isLoadingDetail ? (
                  <div className="py-16 text-center text-slate-400">Loading full application record...</div>
                ) : appDetail ? (
                  <>
                    {/* Status Management Bar */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                            Change Application Status
                          </span>
                          <span className="text-xs text-slate-400">Current Status: <strong>{appDetail.status}</strong></span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {['Submitted', 'Under Review', 'Approved', 'Rejected'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              disabled={isUpdatingStatus || appDetail.status === st}
                              onClick={() => handleStatusChange(st)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                appDetail.status === st
                                  ? 'bg-teal-900 text-white shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Mark {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Add internal administrator audit note (optional)..."
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                        />
                      </div>

                      {statusUpdateMsg && (
                        <p className="text-xs text-teal-800 font-bold">{statusUpdateMsg}</p>
                      )}
                    </div>

                    {/* Applicant & Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs text-teal-900">
                          Applicant Particulars
                        </h4>
                        <div><span className="text-slate-400">Category:</span> <strong>{appDetail.category}</strong> {appDetail.occupancy_status ? `(${appDetail.occupancy_status})` : ''}</div>
                        <div><span className="text-slate-400">Name:</span> <strong>{appDetail.applicant_title} {appDetail.applicant_name}</strong></div>
                        {appDetail.org_name && (
                          <div><span className="text-slate-400">Org:</span> <strong>{appDetail.org_name}</strong> ({appDetail.org_representative} - {appDetail.org_designation})</div>
                        )}
                        <div><span className="text-slate-400">Phone:</span> <strong>+91 {appDetail.contact_number}</strong></div>
                        <div><span className="text-slate-400">Email:</span> <strong>{appDetail.contact_email}</strong></div>
                        <div><span className="text-slate-400">DOB:</span> {appDetail.dob || 'N/A'} • <span className="text-slate-400">Gender:</span> {appDetail.gender || 'N/A'}</div>
                        <div><span className="text-slate-400">Existing Customer:</span> {appDetail.existingCustomer ? `Yes (${appDetail.consumer_number})` : 'No'}</div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs text-teal-900">
                          Connection Address (Site)
                        </h4>
                        {appDetail.connectionAddress ? (
                          <p className="leading-relaxed font-medium">
                            {appDetail.connectionAddress.line1}
                            {appDetail.connectionAddress.line2 && <>, {appDetail.connectionAddress.line2}</>}
                            <br />
                            {appDetail.connectionAddress.area}, {appDetail.connectionAddress.city}
                            <br />
                            {appDetail.connectionAddress.state} — <strong>{appDetail.connectionAddress.pincode}</strong>
                          </p>
                        ) : 'No address recorded'}
                      </div>
                    </div>

                    {/* Pricing Snapshot */}
                    {appDetail.pricing && (
                      <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="font-bold text-teal-950 text-sm block">
                            {appDetail.pricing.plan_name} ({appDetail.pricing.speed_mbps} Mbps)
                          </span>
                          <span className="text-slate-500">
                            Billing Frequency: <strong>{appDetail.pricing.billing_frequency}</strong> • Base: ₹{appDetail.pricing.basePriceRupees} • GST 18%: ₹{appDetail.pricing.taxRupees} • Install: ₹{appDetail.pricing.installationRupees}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[11px] block">Snapshot Total Amount</span>
                          <span className="text-xl font-black text-teal-950">
                            ₹{appDetail.pricing.totalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Uploaded Documents (Secure Access) */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs text-teal-900">
                        Uploaded Identity & Address Documents ({appDetail.documents?.length || 0})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {appDetail.documents && appDetail.documents.length > 0 ? (
                          appDetail.documents.map((doc: any) => (
                            <div key={doc.id} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <FileText className="w-5 h-5 text-teal-700 shrink-0" />
                                <div className="overflow-hidden">
                                  <span className="font-bold text-slate-900 block truncate">{doc.docLabel}</span>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {doc.originalFilename} ({(doc.fileSize / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={getDocumentPreviewUrl(doc.id, token || undefined)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </a>
                                <a
                                  href={getDocumentDownloadUrl(doc.id, token || undefined)}
                                  className="p-1 text-slate-400 hover:text-teal-700 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 text-xs italic">No uploaded documents attached.</div>
                        )}
                      </div>
                    </div>

                    {/* Status History Audit Log */}
                    {appDetail.statusHistory && appDetail.statusHistory.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs text-teal-900 flex items-center gap-1.5">
                          <History className="w-4 h-4" />
                          <span>Status & Audit History</span>
                        </h4>
                        <div className="space-y-1.5">
                          {appDetail.statusHistory.map((h: any) => (
                            <div key={h.id} className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-800">{h.previous_status} → {h.new_status}</span> by <strong className="text-teal-900">{h.changed_by}</strong>
                                {h.notes && <div className="text-slate-500 mt-0.5">{h.notes}</div>}
                              </div>
                              <span className="text-slate-400 whitespace-nowrap">{new Date(h.created_at).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAppId(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
