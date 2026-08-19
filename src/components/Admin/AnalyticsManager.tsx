import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  MousePointerClick, 
  Monitor, 
  Smartphone, 
  Globe, 
  Calendar,
  Layers,
  FileText,
  Search,
  Download
} from 'lucide-react';
import { 
  ApplicationClick, 
  InternalApplication, 
  OfficialReportingApp 
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

interface AnalyticsManagerProps {
  clicks: ApplicationClick[];
  internalApps: InternalApplication[];
  officialApps: OfficialReportingApp[];
}

export const AnalyticsManager: React.FC<AnalyticsManagerProps> = ({
  clicks,
  internalApps,
  officialApps
}) => {
  const [searchLog, setSearchLog] = useState('');

  // Combined traffic rankings
  const appRankings = useMemo(() => {
    const list = [
      ...internalApps.map(a => ({ id: a.id, name: a.name, type: 'Internal', clicks: a.click_count || 0, unit: a.unit })),
      ...officialApps.map(a => ({ id: a.id, name: a.name, type: 'Official', clicks: a.click_count || 0, unit: a.institution }))
    ];
    return list.sort((a, b) => b.clicks - a.clicks);
  }, [internalApps, officialApps]);

  const totalClicksCount = useMemo(() => {
    return appRankings.reduce((sum, item) => sum + item.clicks, 0);
  }, [appRankings]);

  // Device mock distribution from clicks / simulated
  const deviceData = [
    { name: 'Desktop / PC Faskes', value: 74, color: '#0284c7' },
    { name: 'Mobile / Tablet Medis', value: 26, color: '#059669' }
  ];

  const typeData = [
    { name: 'Aplikasi Internal RSUD', value: internalApps.reduce((acc, a) => acc + (a.click_count || 0), 0), color: '#0284c7' },
    { name: 'Pelaporan Resmi Kemenkes/BPJS', value: officialApps.reduce((acc, a) => acc + (a.click_count || 0), 0), color: '#059669' }
  ];

  // Filtered click logs
  const filteredClicks = clicks.filter(c => {
    if (!searchLog) return true;
    const q = searchLog.toLowerCase();
    const appName = [...internalApps, ...officialApps].find(a => a.id === c.app_id)?.name || '';
    return appName.toLowerCase().includes(q) || c.ip_address?.toLowerCase().includes(q) || c.app_type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            LIVE ANALYTICS & TRAFFIC
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Statistik Peluncuran & Akses Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau intensitas penggunaan aplikasi internal dan pelaporan resmi di RSUD Al-Mulk
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-indigo-600">
            {totalClicksCount.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-400 font-medium">Total Akumulasi Klik</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Portals Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Peringkat Peluncuran Aplikasi Teratas
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Grafik 10 portal paling sering dibuka oleh user
          </p>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appRankings.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} 
                  formatter={(val: any) => [`${val} kali`, 'Frekuensi Buka']}
                />
                <Bar dataKey="clicks" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown by Type */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Rasio Akses Internal vs Resmi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Komparasi beban trafik sistem
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-type-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Desktop: <strong>74%</strong></span>
            <span>Mobile: <strong>26%</strong></span>
          </div>
        </div>

      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">
            Tabel Rekapitulasi Klik Seluruh Portal
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Diperbarui secara real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Peringkat</th>
                <th className="px-6 py-4">Nama Aplikasi / Portal</th>
                <th className="px-6 py-4">Kategori Sistem</th>
                <th className="px-6 py-4">Unit / Instansi</th>
                <th className="px-6 py-4 text-right">Total Klik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appRankings.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-bold font-mono text-slate-500">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.type === 'Internal' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.type === 'Internal' ? 'Internal RSUD' : 'Pelaporan Resmi'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">
                    {item.unit}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono font-black text-slate-900">
                    {item.clicks.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
