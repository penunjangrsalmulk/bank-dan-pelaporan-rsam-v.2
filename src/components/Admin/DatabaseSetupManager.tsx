import React, { useState, useEffect } from 'react';
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
  Radio,
  UploadCloud,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  getSupabaseCredentials, 
  saveCustomSupabaseCredentials, 
  getSupabaseClient 
} from '../../lib/supabase';
import { generateSupabaseSchemaSQL } from '../../services/sqlGenerator';
import { resetToInitialSeedData, syncAllLocalDataToSupabase } from '../../services/databaseService';
import Swal from 'sweetalert2';

interface DatabaseSetupManagerProps {
  onDataReset: () => void;
}

export const DatabaseSetupManager: React.FC<DatabaseSetupManagerProps> = ({ onDataReset }) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.anonKey);
  const [isConnected, setIsConnected] = useState(initialCreds.isConfigured);

  const sqlScript = generateSupabaseSchemaSQL();

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    const updated = getSupabaseCredentials();
    setIsConnected(updated.isConfigured);

    if (updated.isConfigured) {
      setTesting(true);
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client.from('website_profile').select('id').limit(1);
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          Swal.fire({
            icon: 'success',
            title: 'Koneksi Supabase Berhasil',
            text: 'Aplikasi kini terhubung langsung ke Cloud Database Supabase.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: 'warning',
          title: 'Kredensial Tersimpan, Namun Tabel Belum Siap',
          text: 'Koneksi terhubung. Pastikan Anda sudah menjalankan Skrip SQL di SQL Editor Supabase agar semua tabel tersedia.'
        });
      } finally {
        setTesting(false);
      }
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Kredensial Dihapus / Mode Lokal Aktif',
        text: 'Aplikasi beralih menggunakan IndexedDB & LocalStorage.'
      });
    }
  };

  const handleSyncToSupabase = async () => {
    if (!isConnected) {
      Swal.fire({
        icon: 'warning',
        title: 'Supabase Belum Terkonfigurasi',
        text: 'Masukkan URL dan Anon Key Supabase Anda terlebih dahulu di form bawah ini.'
      });
      return;
    }

    setSyncing(true);
    try {
      const result = await syncAllLocalDataToSupabase();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Sinkronisasi Berhasil!',
          text: result.message,
          timer: 2500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Sinkronisasi',
          text: result.message
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: err.message || 'Gagal mengirim data ke Supabase.'
      });
    } finally {
      setSyncing(false);
    }
  };

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
      
      {/* Header & Status Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            BACKEND & DATABASE ARCHITECTURE
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Integrasi Supabase & Sinkronisasi Cloud
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Arsitektur Cloud PostgreSQL, Storage, Realtime, dan Sinkronisasi Multi-Platform
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className={`w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Status Penyimpanan:</span>
            <span className="font-bold text-slate-800">
              {isConnected ? 'Supabase Cloud (Terhubung)' : 'Penyimpanan Lokal / Hybrid'}
            </span>
          </div>
        </div>
      </div>

      {/* Explanation Box: Why Vercel and AI Studio might differ */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-3xl p-6 border border-sky-100 space-y-3">
        <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
          <HelpCircle className="w-5 h-5 text-sky-600 shrink-0" />
          <span>Mengapa Tampilan di Vercel & AI Studio Bisa Berbeda?</span>
        </div>
        <p className="text-xs text-sky-950/80 leading-relaxed">
          1. <strong>Domain Berbeda</strong>: Sebelum Supabase terhubung, data disimpan di memori browser (LocalStorage/IndexedDB) masing-masing domain. Data yang Anda edit di AI Studio tidak otomatis ada di domain Vercel.<br />
          2. <strong>Hubungkan Supabase</strong>: Dengan menghubungkan Supabase di bawah ini dan di Environment Variables Vercel (`VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`), seluruh data akan tersinkronisasi 100% secara realtime di semua platform!
        </p>
      </div>

      {/* Supabase Connection Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-600" />
              Konfigurasi Kredensial Supabase
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dapatkan URL dan Anon Key dari dashboard Supabase Anda di menu <strong>Project Settings → API</strong>.
            </p>
          </div>
          {isConnected && (
            <button
              onClick={handleSyncToSupabase}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
              <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Data Lokal ke Supabase'}</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxxxxxx.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-mono text-slate-800 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-mono text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700 font-medium">Supabase aktif dan siap digunakan</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <span>Kredensial belum diisi (menggunakan penyimpanan lokal)</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>Simpan & Tes Koneksi</span>
            </button>
          </div>
        </form>
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

