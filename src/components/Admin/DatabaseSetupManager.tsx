import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  Server, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle,
  FileCode2,
  Lock,
  Radio
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseClient } from '../../lib/supabase';
import { generateSupabaseSchemaSQL } from '../../services/sqlGenerator';
import { resetToInitialSeedData } from '../../services/databaseService';
import Swal from 'sweetalert2';

interface DatabaseSetupManagerProps {
  onDataReset: () => void;
}

export const DatabaseSetupManager: React.FC<DatabaseSetupManagerProps> = ({ onDataReset }) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const isConnected = isSupabaseConfigured();
  const sqlScript = generateSupabaseSchemaSQL();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetData = async () => {
    const res = await Swal.fire({
      title: 'Reset ke Data Bawaan RSUD Al-Mulk?',
      text: 'Seluruh data aplikasi, pelaporan resmi, profil faskes, media hero, dan tautan sosial akan dikembalikan ke data awal terverifikasi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Reset Data',
      cancelButtonText: 'Batal'
    });

    if (res.isConfirmed) {
      setResetting(true);
      resetToInitialSeedData();
      onDataReset();
      setResetting(false);
      Swal.fire({
        icon: 'success',
        title: 'Data Berhasil Direset',
        text: 'Database portal telah disinkronkan kembali.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            BACKEND & DATABASE ARCHITECTURE
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Integrasi Supabase & Skrip Database
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Arsitektur PostgreSQL, Auth, Storage, Realtime, dan Row Level Security (RLS)
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-500'}`} />
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Status Penyimpanan:</span>
            <span className="font-bold text-slate-800">
              {isConnected ? 'Supabase Cloud PostgreSQL' : 'Local Persistence & Sync (Hybrid)'}
            </span>
          </div>
        </div>
      </div>

      {/* Supabase Overview Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">PostgreSQL & Realtime</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tabel aplikasi internal, pelaporan resmi, metadata faskes, klik, dan audit log dengan dukungan WebSocket subscription.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
            RLS Policy Activated
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Supabase Auth</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Autentikasi administrator terpusat dengan role-based access control (Super Admin, Seksi Penunjang, Admin RS).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 font-mono">
            JWT Session Token
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold mb-3">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Storage & Bucket</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Bucket penyimpanan aset gambar logo aplikasi, background hero, dan media publik RSUD Al-Mulk.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-indigo-300 font-mono">
            website-assets (Public)
          </div>
        </div>

      </div>

      {/* SQL Script Generator Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-600" />
              Skrip SQL Lengkap Skema Database Supabase
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Jalankan skrip ini sekali di <strong>Supabase Dashboard → SQL Editor</strong> untuk membuat seluruh tabel, storage bucket, dan hak akses RLS secara instan.
            </p>
          </div>

          <button
            onClick={handleCopySQL}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Skrip SQL Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Seluruh Skrip SQL</span>
              </>
            )}
          </button>
        </div>

        {/* Code View */}
        <div className="relative">
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
            <code>{sqlScript}</code>
          </pre>
        </div>

      </div>

      {/* Danger Zone / Reset Database */}
      <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Sinkronisasi & Reset Data Awal
          </div>
          <p className="text-xs text-rose-700/90 leading-relaxed">
            Kembalikan seluruh data aplikasi internal RSUD, pelaporan resmi Kemenkes/BPJS, hero media, dan informasi rumah sakit ke dataset standar RSUD Al-Mulk Kota Sukabumi.
          </p>
        </div>

        <button
          onClick={handleResetData}
          disabled={resetting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>Reset ke Data Bawaan</span>
        </button>
      </div>

    </div>
  );
};
