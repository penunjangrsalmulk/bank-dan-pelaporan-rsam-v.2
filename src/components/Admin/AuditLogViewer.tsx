import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  User, 
  Database, 
  ShieldCheck,
  CheckCircle,
  Filter
} from 'lucide-react';
import { AuditLog } from '../../types/database';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('Semua');

  const filteredLogs = logs.filter(l => {
    const q = search.toLowerCase();
    const match = 
      l.table_name.toLowerCase().includes(q) ||
      (l.user_email && l.user_email.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q));

    if (!match) return false;
    if (selectedAction !== 'Semua' && l.action !== selectedAction) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ClipboardList className="w-3.5 h-3.5 text-slate-600" />
            KEAMANAN & AKUNTABILITAS
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Log Audit Perubahan Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Riwayat lengkap penambahan, pengeditan, dan penghapusan data oleh akun administrator
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600">
          Total: <strong>{logs.length}</strong> Catatan Audit
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari email, aksi, atau tabel..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Jenis Aksi:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium focus:outline-none"
          >
            <option value="Semua">Semua Aksi</option>
            <option value="CREATE">CREATE (Tambah)</option>
            <option value="UPDATE">UPDATE (Ubah)</option>
            <option value="DELETE">DELETE (Hapus)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Tabel Database</th>
                <th className="px-6 py-4">Pengguna (Admin)</th>
                <th className="px-6 py-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                      log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'UPDATE' ? 'bg-sky-100 text-sky-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">
                    {log.table_name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {log.user_email || 'Super Admin (System)'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] text-slate-500 font-mono">
                      ID: {log.record_id ? log.record_id.slice(0, 18) + '...' : '-'}
                    </span>
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
