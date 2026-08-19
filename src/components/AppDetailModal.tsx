import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Building, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  Layers,
  MousePointerClick,
  Share2
} from 'lucide-react';
import { InternalApplication, OfficialReportingApp } from '../types/database';

interface AppDetailModalProps {
  app: InternalApplication | OfficialReportingApp | null;
  type: 'internal' | 'official';
  onClose: () => void;
  onLaunch: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  type,
  onClose,
  onLaunch
}) => {
  const [copied, setCopied] = useState(false);

  if (!app) return null;

  const isInternal = type === 'internal';
  const internalApp = isInternal ? (app as InternalApplication) : null;
  const officialApp = !isInternal ? (app as OfficialReportingApp) : null;

  const handleCopyLink = () => {
    const url = window.location.origin + `/app/${app.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = app.created_at 
    ? new Date(app.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '10 Januari 2025';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#020617]/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Modal Top Header Banner */}
        <div className={`p-6 sm:p-8 text-white relative overflow-hidden border-b border-white/10 ${
          isInternal 
            ? 'bg-gradient-to-r from-blue-900/30 via-cyan-900/30 to-[#020617]' 
            : 'bg-gradient-to-r from-emerald-950/30 via-teal-900/30 to-[#020617]'
        }`}>
          <div className="absolute top-0 right-0 p-4">
            <button
              id="btn-close-detail-modal"
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-10">
            {/* Logo */}
            <div className={`w-16 h-16 rounded-2xl border p-1 shadow-lg shrink-0 flex items-center justify-center overflow-hidden ${
              isInternal ? 'bg-blue-600/20 border-cyan-500/30' : 'bg-emerald-600/20 border-emerald-500/30'
            }`}>
              {app.logo_url ? (
                <img 
                  src={app.logo_url} 
                  alt={app.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <Layers className={`w-8 h-8 ${isInternal ? 'text-cyan-400' : 'text-emerald-400'}`} />
              )}
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {isInternal ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    DIBUAT INTERNAL RSUD AL-MULK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    SISTEM EKSTERNAL / RESMI
                  </span>
                )}

                {app.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    Unggulan
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {app.name}
              </h3>
              <p className="text-[11px] font-mono text-cyan-400/80 mt-0.5">
                slug: /{app.slug}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
          
          {/* Description Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Deskripsi & Fungsi Aplikasi
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
              {app.description}
            </p>
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                {isInternal ? 'Unit Pengelola' : 'Instansi Pemilik'}
              </div>
              <div className="text-xs font-bold text-white">
                {isInternal ? internalApp?.unit : officialApp?.institution}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Kategori Layanan
              </div>
              <div className="text-xs font-bold text-white">
                {app.category}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Status Operasional
              </div>
              <div className="text-xs font-bold capitalize flex items-center gap-1.5">
                {app.status === 'aktif' && <span className="text-emerald-400 font-bold">● Aktif / Siap Digunakan</span>}
                {app.status === 'maintenance' && <span className="text-amber-400 font-bold">● Pemeliharaan (Maintenance)</span>}
                {app.status === 'nonaktif' && <span className="text-rose-400 font-bold">● Nonaktif</span>}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Tanggal Terdaftar
              </div>
              <div className="text-xs font-bold text-white">
                {formattedDate}
              </div>
            </div>

          </div>

          {/* URL & Security Information */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-bold text-cyan-300 mb-1 flex items-center justify-between">
              <span>Alamat URL Aplikasi:</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md font-mono border border-cyan-800/40">
                Protokol URL
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 break-all bg-slate-950/60 p-2.5 rounded-lg border border-white/5 mt-1">
              {app.app_url}
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Bagikan Portal Ini</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              id="btn-modal-launch-app"
              onClick={() => {
                onLaunch(app, type);
              }}
              disabled={app.status === 'nonaktif'}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                app.status === 'nonaktif'
                  ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-600/90 hover:bg-cyan-500 shadow-cyan-500/20 border border-cyan-400/30'
              }`}
            >
              <span>BUKA APLIKASI SEKARANG</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
