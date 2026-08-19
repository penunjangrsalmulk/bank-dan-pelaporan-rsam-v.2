import React from 'react';
import { Layers, FileText, Globe2, MousePointerClick, ShieldCheck, Activity } from 'lucide-react';

interface StatisticsSectionProps {
  internalCount: number;
  officialCount: number;
  totalClicks: number;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  internalCount,
  officialCount,
  totalClicks,
}) => {
  const totalPortals = internalCount + officialCount;

  return (
    <section id="section-statistik" className="py-16 sm:py-20 relative z-10">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider mb-2 text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            RINGKASAN EKOSISTEM DIGITAL
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-white tracking-tight">
            Statistik Integrasi & Pemanfaatan Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            Data real-time portal terpadu dan tingkat pemanfaatan aplikasi di RSUD Al-Mulk Kota Sukabumi.
          </p>
        </div>

        {/* Counter Grid Widescreen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Internal */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 hover:border-cyan-500/30 transition-all flex flex-col items-center text-center group shadow-lg shadow-black/20">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-cyan-400 tracking-tight">
              {internalCount}
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1.5">
              Aplikasi Internal
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">
              Inovasi Mandiri RSUD Al-Mulk
            </div>
          </div>

          {/* Card 2: Official */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center group shadow-lg shadow-black/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-emerald-400 tracking-tight">
              {officialCount}
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1.5">
              Sistem Pelaporan
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">
              Kemenkes, BPJS & Nasional
            </div>
          </div>

          {/* Card 3: Total Portals */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center text-center group shadow-lg shadow-black/20">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-white tracking-tight">
              {totalPortals}
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1.5">
              Total Portal Terpadu
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">
              1 Pintu Akses Cepat Rumah Sakit
            </div>
          </div>

          {/* Card 4: Total Clicks */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 hover:border-cyan-500/30 transition-all flex flex-col items-center text-center group shadow-lg shadow-black/20">
            <div className="w-12 h-12 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center mb-3 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform font-bold">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-cyan-300 tracking-tight font-mono">
              {totalClicks.toLocaleString('id-ID')}
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1.5">
              Total Akses Peluncuran
            </div>
            <div className="text-[10px] sm:text-xs text-cyan-400 mt-0.5 font-mono">
              Live Click Monitoring
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
