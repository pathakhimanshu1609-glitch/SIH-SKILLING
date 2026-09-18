import React, { useState } from 'react';
import { 
  MessageSquare, 
  PhoneCall, 
  HelpCircle, 
  X, 
  ExternalLink, 
  Mail, 
  Clock, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { WhatsAppWidget } from '../WhatsAppWidget';

/**
 * Consolidated Floating Action Stack (Bottom-Right)
 * Unifies:
 * 1. WhatsApp AI Assistant (#25D366)
 * 2. National Skilling Helpline & Official Support (#0B3D6B)
 * Consistent circular, shadowed, brand-colored styling across all pages.
 */
export const FloatingActionStack = () => {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  return (
    <>
      {/* WhatsApp Interactive Widget */}
      {isWhatsAppOpen && (
        <WhatsAppWidget 
          isOpen={true} 
          onClose={() => setIsWhatsAppOpen(false)} 
          isFloatingTriggerHidden={true} 
        />
      )}

      {/* Official National Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden relative animate-fade-in-up">
            {/* Sovereign Navy Header */}
            <div className="bg-[#0B3D6B] text-white px-5 py-4 flex items-center justify-between border-b border-[#072847]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#072847] border border-[#C9A227] flex items-center justify-center font-bold text-xs font-mono text-[#C9A227]">
                  GOV
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight">Career Bridge Support Desk</h3>
                  <p className="text-[10px] text-blue-200">MSDE • Official Candidate & Center Helpdesk</p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded transition-colors"
                aria-label="Close Support Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Helpline Details Content */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 space-y-1.5">
                <div className="flex items-center gap-2 text-[#0B3D6B] font-bold">
                  <PhoneCall className="w-4 h-4 text-[#D2691E]" />
                  <span className="text-sm font-mono tracking-tight">1800-11-2026 (Toll-Free)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  National Council for Vocational Training & MSDE Helpline. Operates Monday to Saturday, 09:00 AM – 06:00 PM IST.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <Mail className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Official Support Email</span>
                    <a href="mailto:support-skilling@nic.in" className="text-[#0B3D6B] hover:underline font-mono">
                      support-skilling@nic.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">CPGRAMS Grievance Redressal</span>
                    <p className="text-[11px] text-slate-500">
                      Lodge formal audit or assessment complaints directly to the central grievance portal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <MessageSquare className="w-4 h-4 text-[#25D366] mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">WhatsApp AI Service Desk</span>
                    <button 
                      onClick={() => {
                        setIsSupportModalOpen(false);
                        setIsWhatsAppOpen(true);
                      }}
                      className="text-emerald-700 font-bold hover:underline text-[11px] flex items-center gap-1 mt-0.5"
                    >
                      <span>Open WhatsApp Bot (Hindi / Marathi / English)</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsSupportModalOpen(false)}
                  className="btn-sid-secondary text-xs py-2 px-4"
                >
                  Close Helpdesk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button Stack (Hidden when full WhatsApp chat window is active to avoid overlapping) */}
      {!isWhatsAppOpen && (
        <aside 
          aria-label="Quick Support and Assistance" 
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto"
        >
          {/* Button 1: Govt National Skilling Helpline (#0B3D6B) */}
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0B3D6B] hover:bg-[#072847] text-white shadow-xl hover:shadow-2xl border border-[#C9A227]/40 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            title="Career Bridge Helpline (1800-11-2026)"
            aria-label="Career Bridge Helpline (1800-11-2026)"
          >
            <PhoneCall className="w-5 h-5 text-[#C9A227]" />
            
            {/* Tooltip on hover */}
            <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-slate-900/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
              Govt Helpline (1800-11-2026)
            </span>
          </button>

          {/* Button 2: WhatsApp AI Assistant (#25D366) */}
          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            title="WhatsApp Bot (Hindi/Marathi)"
            aria-label="WhatsApp AI Assistant"
          >
            <MessageSquare className="w-6 h-6 fill-white" />
            <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-300 border-2 border-white animate-pulse" />

            {/* Tooltip on hover */}
            <span className="pointer-events-none absolute right-15 whitespace-nowrap rounded-md bg-slate-900/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
              WhatsApp AI Bot (Hindi / Marathi / English)
            </span>
          </button>
        </aside>
      )}
    </>
  );
};
