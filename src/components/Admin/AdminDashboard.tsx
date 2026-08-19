import React, { useMemo } from 'react';
import { 
  Layers, 
  FileText, 
  MousePointerClick, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  TrendingUp, 
  Sparkles, 
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import { 
  InternalApplication, 
  OfficialReportingApp, 
  ApplicationClick, 
  WebsiteProfile, 
  AuditLog 
} from '../../types/database';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface AdminDashboardProps {
  internalApps: InternalApplication[];
  officialApps: OfficialReportingApp[];
  clicks: ApplicationClick[];
  auditLogs: AuditLog[];
  profile: WebsiteProfile;
  onNavigateTab: (tab: string) => void;
  onAddNewInternal: () => void;
  onAddNewOfficial: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  internalApps,
  officialApps,
  clicks,
  auditLogs,
  profile,
  onNavigateTab,
  onAddNewInternal,
  onAddNewOfficial
}) => {
  const totalInternal = internalApps.length;
  const totalOfficial = officialApps.length;
  const totalApps = totalInternal + totalOfficial;

  const totalActive = 
    internalApps.filter(a => a.status === 'aktif').length +
    officialApps.filter(a => a.status === 'aktif').length;

  const totalMaintenance = 
    internalApps.filter(a => a.status === 'maintenance').length +
    officialApps.filter(a => a.status === 'maintenance').length;

  const totalClicksCount = useMemo(() => {
    const internalSum = internalApps.reduce((acc, a) => acc + (a.click_count || 0), 0);
    const officialSum = officialApps.reduce((acc, a) => acc + (a.click_count || 0), 0);
    return Math.max(internalSum + officialSum, clicks.length);
  }, [internalApps, officialApps, clicks]);

  // Top 10 Most Clicked Apps Chart Data
  const top10Data = useMemo(() => {
    const combined = [
      ...internalApps.map(a => ({ name: a.name, clicks: a.click_count || 0, type: 'Internal' })),
      ...officialApps.map(a => ({ name: a.name, clicks: a.click_count || 0, type: 'Resmi' }))
    ];
    return combined.sort((a, b) => b.clicks - a.clicks).slice(0, 8);
  }, [internalApps, officialApps]);

  // Category Distribution Chart Data
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    internalApps.forEach(a => map.set(a.category, (map.get(a.category) || 0) + 1));
    officialApps.forEach(a => map.set(a.category, (map.get(a.category) || 0) + 1));

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [internalApps, officialApps]);

  const COLORS = ['#0284c7', '#059669', '#0d9488', '#4f46e5', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-bold uppercase tracking-wider mb-2 border border-cyan-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            PANEL KONTROL ADMINISTRASI UTAMA
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Bank Aplikasi RSUD Al-Mulk
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Kelola portal website, aplikasi internal faskes, pelaporan resmi nasional, dan pantau metrik pemanfaatan secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onAddNewInternal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aplikasi Internal</span>
          </button>

          <button
            onClick={onAddNewOfficial}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelaporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div 
          onClick={() => onNavigateTab('internal-apps')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalInternal}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-1">
            Aplikasi Internal RSUD
          </div>
          <div className="text-[11px] text-sky-600 font-semibold mt-0.5">
            Dikelola Seksi / Unit RS
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('official-apps')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalOfficial}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-1">
            Pelaporan Resmi Pemerintah
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Kemenkes, BPJS, Dinkes
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {Math.round((totalActive / (totalApps || 1)) * 100)}% Siap
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalActive}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-1">
            Aplikasi Aktif Siap Pakai
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalMaintenance} Dalam Maintenance
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('analytics')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalClicksCount.toLocaleString('id-ID')}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-1">
            Total Akses / Peluncuran
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
            Lihat Analitik Penggunaan →
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Chart: Top 8 Most Clicked Apps */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Aplikasi Paling Sering Diakses (Top Traffic)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frekuensi peluncuran sistem oleh petugas medis dan staf faskes
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800"
            >
              Semua →
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10Data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} 
                  formatter={(val: any) => [`${val} kali diakses`, 'Jumlah Klik']}
                />
                <Bar dataKey="clicks" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Category Distribution */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Distribusi Kategori Layanan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporsi jenis modul aplikasi yang terdaftar di portal
            </p>
          </div>

          <div className="h-64 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
            Total {totalApps} sistem terklasifikasi secara dinamis
          </div>
        </div>

      </div>

      {/* Recent Activity / Audit Log Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Aktivitas Pembaruan & Audit Terakhir
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan riwayat perubahan data oleh administrator
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('audit-log')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800"
          >
            Lihat Audit Log Lengkap →
          </button>
        </div>

        <div className="space-y-3">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] ${
                  log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                  log.action === 'UPDATE' ? 'bg-sky-100 text-sky-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {log.action}
                </span>
                <div>
                  <span className="font-bold text-slate-800">{log.table_name}</span>
                  <span className="text-slate-500 ml-2">oleh {log.user_email || 'admin'}</span>
                </div>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
