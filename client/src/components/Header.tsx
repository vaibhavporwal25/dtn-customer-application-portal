import React from 'react';
import { ShieldCheck, Phone, FileText, Search, LayoutDashboard, ExternalLink } from 'lucide-react';

interface HeaderProps {
  currentView: 'portal' | 'admin' | 'lookup';
  onNavigate: (view: 'portal' | 'admin' | 'lookup') => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdminLoggedIn }) => {
  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Demo Notice & Helpline Banner */}
      <div className="bg-[#091b1e] text-slate-300 text-xs py-1.5 px-4 border-b border-teal-900/60">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
              Demonstration Mode
            </span>
            <span className="hidden sm:inline text-slate-400">
              Digital Telco Network India Pvt. Ltd. — Prototype for evaluation
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto text-[11px]">
            <a href="tel:9810114338" className="flex items-center gap-1.5 text-slate-200 hover:text-amber-400 font-medium transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Care: <strong className="text-white">9810114338</strong></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-[#0e272b] text-white px-4 py-3.5 border-b border-teal-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => onNavigate('portal')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* DTN Emblem */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0e272b] rounded-full flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform">
                  {/* Outer globe arcs */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.4" />
                  <ellipse cx="50" cy="50" rx="42" ry="18" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.4" />
                  <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="5" opacity="0.4" />
                  {/* Broadcast signal arcs */}
                  <path d="M25 65 A30 30 0 0 1 75 65" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" fill="none" />
                  <path d="M35 55 A18 18 0 0 1 65 55" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" fill="none" />
                  <circle cx="50" cy="46" r="6" fill="#f59e0b" />
                </svg>
              </div>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-wider text-white flex items-center gap-1.5 leading-none">
                DTN INDIA
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-amber-400 uppercase leading-tight mt-0.5">
                Digital Telco Network
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('portal')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'portal'
                  ? 'bg-teal-700/60 text-white shadow-inner border border-teal-500/40'
                  : 'text-slate-200 hover:bg-teal-900/40 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">New</span> Application
            </button>

            <button
              onClick={() => onNavigate('lookup')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'lookup'
                  ? 'bg-teal-700/60 text-white shadow-inner border border-teal-500/40'
                  : 'text-slate-200 hover:bg-teal-900/40 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Track Status</span>
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-teal-900/60 text-slate-200 hover:bg-teal-800/80 border border-teal-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span> Dashboard
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Pay Bill CTA from Website Reference */}
            <button
              onClick={() => onNavigate('lookup')}
              className="bg-[#d92626] hover:bg-[#b91c1c] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide uppercase shadow-md transition-all active:scale-95"
            >
              Pay Bill
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
