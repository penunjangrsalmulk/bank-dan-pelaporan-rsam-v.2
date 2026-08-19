import React from 'react';
import { 
  ExternalLink, 
  Sparkles, 
  AlertTriangle, 
  XCircle, 
  Building, 
  ShieldCheck,
  Layers,
  Info
} from 'lucide-react';
import { InternalApplication, OfficialReportingApp } from '../types/database';

interface ApplicationCardProps {
  app: InternalApplication | OfficialReportingApp;
  type: 'internal' | 'official';
  onOpenDetail: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
  onLaunchApp: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  app,
  type,
  onOpenDetail,
  onLaunchApp
}) => {
  const isInternal = type === 'internal';
  const internalApp = isInternal ? (app as InternalApplication) : null;
  const officialApp = !isInternal ? (app as OfficialReportingApp) : null;

  const isMaintenance = app.status === 'maintenance';
  const isInactive = app.status === 'nonaktif';
  const isFeatured = app.is_featured;

  const getStatusBadge = () => {
    switch (app.status) {
      case 'aktif':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Aktif
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            Maintenance
          </span>
        );
      case 'nonaktif':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-2.5 h-2.5" />
            Nonaktif
          </span>
        );
    }
  };

  return (
    <div 
      id={`card-app-${app.id}`}
      className="group bg-slate-900/60 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-400/50 p-5 rounded-2xl backdrop-blur-xl transition-all duration-200 flex flex-col justify-between relative shadow-lg shadow-black/30 hover:shadow-cyan-500/10 hover:-translate-y-1"
    >
      {/* Featured Ribbon */}
      {isFeatured && (
        <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md shadow-amber-500/30 border border-white/20">
          <Sparkles className="w-2.5 h-2.5" />
          Unggulan
        </div>
      )}

      {/* Main Focus Area: Logo & App Name */}
      <div 
        className="cursor-pointer" 
        onClick={() => onOpenDetail(app, type)}
      >
        <div className="flex items-center gap-3.5 mb-3.5">
          {/* 1. App Logo */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border overflow-hidden shrink-0 transition-transform group-hover:scale-105 shadow-md ${
            isInternal 
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/30 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10' 
              : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/30 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
          }`}>
            {app.logo_url ? (
              <img 
                src={app.logo_url} 
                alt={app.name}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  // Fallback to icon on broken image
                  (e.target as HTMLElement).style.display = 'none'; 
                }}
              />
            ) : (
              <Layers className="w-7 h-7" />
            )}
          </div>

          {/* 2. App Name & Unit/Institution */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge()}
              <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border truncate ${
                isInternal 
                  ? 'bg-blue-500/15 text-cyan-300 border-cyan-400/20' 
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20'
              }`}>
                {app.category || (isInternal ? 'Internal' : 'Pelaporan')}
              </span>
            </div>

            <h4 className="font-bold text-base sm:text-lg text-white leading-snug group-hover:text-cyan-300 transition-colors line-clamp-1">
              {app.name}
            </h4>

            {isInternal && internalApp?.unit && (
              <p className="text-[11px] text-slate-300 truncate flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{internalApp.unit}</span>
              </p>
            )}
            {!isInternal && officialApp?.institution && (
              <p className="text-[11px] text-slate-300 truncate flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{officialApp.institution}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Link Buka Aplikasi (Primary Direct Action) */}
      <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetail(app, type)}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white/5"
          title="Lihat informasi sistem"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Info</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onLaunchApp(app, type);
          }}
          disabled={app.status === 'nonaktif'}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
            app.status === 'nonaktif'
              ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
              : isInternal
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-cyan-500/20 hover:scale-102'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black shadow-emerald-500/20 hover:scale-102'
          }`}
        >
          <span>Buka Aplikasi</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
