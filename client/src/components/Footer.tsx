import React from 'react';
import { Phone, Mail, MapPin, Shield, CheckCircle, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0e272b] text-slate-300 border-t border-teal-900 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-teal-800/40">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-white">
                DTN INDIA
              </span>
            </div>
            <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
              Digital Telco Network India Pvt. Ltd.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering residential and business communities with next-generation optical fibre broadband, dedicated lease lines, and carrier-grade connectivity.
            </p>
          </div>

          {/* Quick Contact from Reference */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-amber-500 pl-2">
              Contact & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">9810114338</div>
                  <div className="text-[11px] text-slate-400">Timing: 10:00 AM – 7:00 PM</div>
                </div>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">support@dtnindia.com</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Delhi NCR Network Operations Center, India</span>
              </li>
            </ul>
          </div>

          {/* Portal Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-cyan-400 pl-2">
              Services Offered
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>BroadBand Internet (FTTH)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Dedicated Lease Line</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Inter-Com & Corporate EPABX</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Enterprise SLA Support</span>
              </li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div className="space-y-3 bg-[#091b1e] p-3.5 rounded-xl border border-teal-800/60">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Info className="w-4 h-4 shrink-0" />
              <span>Demonstration Deployment</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This application portal is an independent prototype built to digitize the physical customer application form. It operates independently with simulated payment processing and private document storage until official DTN India review.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Digital Telco Network India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Strictly for Evaluation & Demo</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-slate-400">Confidential & Proprietary</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
