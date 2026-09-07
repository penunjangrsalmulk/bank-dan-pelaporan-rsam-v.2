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
  HelpCircle,
  Table,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  getSupabaseCredentials, 
  saveCustomSupabaseCredentials, 
  getSupabaseClient,
  testSupabaseConnection,
  SupabaseConnectionTestResult,
  normalizeSupabaseUrl,
  normalizeSupabaseKey,
  getSupabaseProjectRef
} from '../../lib/supabase';
import { generateSupabaseSchemaSQL } from '../../services/sqlGenerator';
import { resetToInitialSeedData, syncAllLocalDataToSupabase } from '../../services/databaseService';
import Swal from 'sweetalert2';

interface DatabaseSetupManagerProps {
  onDataReset: () => void;
}

export const DatabaseSetupManager: React.FC<DatabaseSetupManagerProps> = ({ onDataReset }) => {
  const [copied, setCopied] = useState(false);
  const [copiedVercelEnv, setCopiedVercelEnv] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [diagResult, setDiagResult] = useState<SupabaseConnectionTestResult | null>(null);
  const [checkingDiag, setCheckingDiag] = useState(false);
  
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.anonKey);
  const [isConnected, setIsConnected] = useState(initialCreds.isConfigured);

  const sqlScript = generateSupabaseSchemaSQL();

  const runDiagnostics = async () => {
    setCheckingDiag(true);
    try {
      const res = await testSupabaseConnection();
      setDiagResult(res);
      setIsConnected(res.connected);
    } catch {
      setDiagResult({
        connected: false,
        tablesReady: false,
        message: 'Gagal menjalankan diagnostik koneksi.'
      });
    } finally {
      setCheckingDiag(false);
    }
  };

  useEffect(() => {
    if (initialCreds.isConfigured) {
      runDiagnostics();
    }
  }, []);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
    const cleanKey = normalizeSupabaseKey(supabaseAnonKey);
    setSupabaseUrl(cleanUrl);
    setSupabaseAnonKey(cleanKey);
    saveCustomSupabaseCredentials(cleanUrl, cleanKey);
    const updated = getSupabaseCredentials();
    setIsConnected(updated.isConfigured);

    if (updated.isConfigured) {
      setTesting(true);
      try {
        const diag = await testSupabaseConnection();
        setDiagResult(diag);
        if (diag.connected && diag.tablesReady) {
          Swal.fire({
            icon: 'success',
            title: 'Koneksi Supabase Berhasil',
            text: 'Aplikasi kini terhubung langsung ke Cloud Database Supabase.',
            timer: 2000,
            showConfirmButton: false
          });
        } else if (diag.connected && !diag.tablesReady) {
          const projectRef = getSupabaseProjectRef();
          const sqlEditorUrl = projectRef 
            ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` 
            : 'https://supabase.com/dashboard';

          Swal.fire({
            icon: 'warning',
            title: 'Kredensial Tersimpan, Namun Tabel Belum Siap',
            html: `
              <p class="text-xs text-slate-600 mb-3">${diag.message}</p>
              <div class="p-3 bg-amber-50 rounded-xl text-left text-xs text-amber-900 space-y-1">
                <div><strong>Langkah Selanjutnya:</strong></div>
                <div>1. Klik tombol di bawah untuk membuka SQL Editor Supabase.</div>
                <div>2. Salin Skrip SQL dari halaman ini dan tempel di SQL Editor Supabase.</div>
                <div>3. Klik tombol <strong>Run</strong> di Supabase.</div>
                <div>4. Kembali ke sini dan klik <strong>Sinkronkan Semua Data</strong>.</div>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Buka SQL Editor Supabase',
            confirmButtonColor: '#0284c7',
            cancelButtonText: 'Tutup'
          }).then((res) => {
            if (res.isConfirmed) {
              window.open(sqlEditorUrl, '_blank', 'noopener,noreferrer');
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Koneksi Gagal',
            text: diag.message
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menguji Koneksi',
          text: err.message || 'Periksa kembali URL dan Anon Key.'
        });
      } finally {
        setTesting(false);
      }
    } else {
      setDiagResult(null);
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
        await runDiagnostics();
        Swal.fire({
          icon: 'success',
          title: 'Sinkronisasi Berhasil!',
          text: result.message,
          timer: 3500,
          showConfirmButton: true
        });
      } else {
        const projectRef = getSupabaseProjectRef();
        const sqlEditorUrl = projectRef 
          ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` 
          : 'https://supabase.com/dashboard';

        Swal.fire({
          icon: 'warning',
          title: 'Tabel Belum Siap di Supabase',
          html: `
            <p class="text-xs text-slate-600 mb-3">${result.message}</p>
            <div class="p-3 bg-amber-50 rounded-xl text-left text-xs text-amber-900 space-y-1">
              <div><strong>Cara Mengatasi:</strong></div>
              <div>1. Klik tombol di bawah untuk membuka SQL Editor Supabase.</div>
              <div>2. Salin Skrip SQL di bawah dan tempel di editor Supabase.</div>
              <div>3. Klik tombol <strong>Run</strong> untuk membuat tabel database.</div>
              <div>4. Klik <strong>Sinkronkan Semua Data</strong> kembali.</div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Buka SQL Editor Supabase',
          confirmButtonColor: '#0284c7',
          cancelButtonText: 'Tutup'
        }).then((res) => {
          if (res.isConfirmed) {
            window.open(sqlEditorUrl, '_blank', 'noopener,noreferrer');
          }
        });
      }
    } catch (err: any) {
      const projectRef = getSupabaseProjectRef();
      const sqlEditorUrl = projectRef 
        ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` 
        : 'https://supabase.com/dashboard';

      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim Data ke Supabase',
        html: `
          <p class="text-xs text-slate-600 mb-3">${err.message || 'Terjadi kesalahan saat menghubungi server Supabase.'}</p>
          <div class="p-3 bg-slate-100 rounded-xl text-left text-xs text-slate-700">
            Pastikan skrip skema database telah dijalankan di SQL Editor Supabase agar seluruh tabel tersedia.
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Buka SQL Editor Supabase',
        confirmButtonColor: '#0284c7',
        cancelButtonText: 'Tutup'
      }).then((res) => {
        if (res.isConfirmed) {
          window.open(sqlEditorUrl, '_blank', 'noopener,noreferrer');
        }
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

  const handleCopyVercelEnv = () => {
    const envText = `VITE_SUPABASE_URL=${supabaseUrl || 'https://xxxxxxxx.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${supabaseAnonKey || 'your-anon-key'}`;
    navigator.clipboard.writeText(envText);
    setCopiedVercelEnv(true);
    setTimeout(() => setCopiedVercelEnv(false), 2500);
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

  const isTablesEmpty = diagResult?.counts && 
    (diagResult.counts.internal_applications === 0 && diagResult.counts.official_reporting_apps === 0);

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
            Integrasi Supabase & Sinkronisasi Cloud Vercel
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pastikan data di Google AI Studio tersinkronisasi 100% dengan Cloud Supabase agar tampil di Vercel
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className={`w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Status Database:</span>
            <span className="font-bold text-slate-800">
              {isConnected ? 'Supabase Cloud (Aktif)' : 'Penyimpanan Lokal / Hybrid'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Table Diagnostics & Sync Banner */}
      {isConnected && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Status Data di Supabase Cloud (Live Diagnostics)
                </h3>
                <p className="text-xs text-slate-500">
                  Jumlah data yang tersimpan di database Supabase saat ini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runDiagnostics}
                disabled={checkingDiag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingDiag ? 'animate-spin' : ''}`} />
                <span>Cek Ulang</span>
              </button>

              <button
                onClick={handleSyncToSupabase}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Semua Data ke Supabase'}</span>
              </button>
            </div>
          </div>

          {/* Table Counts Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Profil RS</div>
              <div className="text-lg font-black text-slate-800">
                {diagResult?.counts ? diagResult.counts.website_profile : '-'}
              </div>
              <div className="text-[10px] text-slate-500">website_profile</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Aplikasi Internal</div>
              <div className={`text-lg font-black ${diagResult?.counts?.internal_applications === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {diagResult?.counts ? diagResult.counts.internal_applications : '-'}
              </div>
              <div className="text-[10px] text-slate-500">internal_applications</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Pelaporan Resmi</div>
              <div className={`text-lg font-black ${diagResult?.counts?.official_reporting_apps === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {diagResult?.counts ? diagResult.counts.official_reporting_apps : '-'}
              </div>
              <div className="text-[10px] text-slate-500">official_reporting_apps</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Hero Media</div>
              <div className="text-lg font-black text-slate-800">
                {diagResult?.counts ? diagResult.counts.hero_media : '-'}
              </div>
              <div className="text-[10px] text-slate-500">hero_media</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Tautan Sosial</div>
              <div className="text-lg font-black text-slate-800">
                {diagResult?.counts ? diagResult.counts.social_links : '-'}
              </div>
              <div className="text-[10px] text-slate-500">social_links</div>
            </div>
          </div>

          {/* Warning banner if table is empty */}
          {isTablesEmpty && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-amber-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Perhatian:</strong> Tabel di Supabase saat ini masih kosong (0 data). Data yang Anda buat di AI Studio saat ini masih tersimpan di LocalStorage. Klik tombol di samping untuk langsung mengirim semua data ke Supabase Cloud!
                </span>
              </div>
              <button
                onClick={handleSyncToSupabase}
                disabled={syncing}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm"
              >
                {syncing ? 'Mengirim Data...' : 'Kirim Data ke Supabase Sekarang'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explanation Box: Why Vercel and AI Studio might differ */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-3xl p-6 border border-sky-100 space-y-3">
        <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
          <HelpCircle className="w-5 h-5 text-sky-600 shrink-0" />
          <span>Cara Menyamakan Tampilan Google AI Studio dengan Vercel:</span>
        </div>
        <div className="text-xs text-sky-950/80 space-y-2 leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span><strong>Jalankan Skrip SQL di Supabase</strong>: Salin skrip SQL di bawah ini dan klik Run di SQL Editor Supabase Anda.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span><strong>Simpan Kredensial di Form Ini</strong>: Masukkan URL & Anon Key Supabase Anda di form bawah dan klik <em>Simpan & Tes Koneksi</em>.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span><strong>Klik "Sinkronkan Semua Data ke Supabase"</strong>: Semua data aplikasi, pelaporan, dan profil akan langsung terisi ke database Supabase Cloud.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
            <span><strong>Set Environment Variables di Vercel</strong>: Tambahkan <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-900 font-mono">VITE_SUPABASE_URL</code> dan <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-900 font-mono">VITE_SUPABASE_ANON_KEY</code> di Vercel Dashboard → Settings → Environment Variables. Setelah redeploy, tampilan Vercel akan 100% sama dengan Google AI Studio!</span>
          </div>
        </div>
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
                onBlur={() => {
                  if (supabaseUrl) {
                    setSupabaseUrl(normalizeSupabaseUrl(supabaseUrl));
                  }
                }}
                placeholder="https://xxxxxxxxxxxxxxxx.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-mono text-slate-800 outline-none transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Format: <code className="bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded font-mono font-medium">https://&lt;id-project&gt;.supabase.co</code> (otomatis dibersihkan jika menyertakan <span className="text-rose-600 font-mono">/rest/v1</span>).
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                onBlur={() => {
                  if (supabaseAnonKey) {
                    setSupabaseAnonKey(normalizeSupabaseKey(supabaseAnonKey));
                  }
                }}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-mono text-slate-800 outline-none transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Dapatkan dari <strong>Project Settings → API</strong> di dashboard Supabase.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-emerald-700 font-medium">
                    {diagResult?.message || 'Supabase aktif dan siap digunakan'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Kredensial belum diisi (aplikasi masih berjalan di LocalStorage)</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={testing}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>Simpan & Tes Koneksi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Vercel Environment Variables Helper Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              Environment Variables untuk Vercel Deployment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Salin kedua nilai ini ke Vercel agar deployment publik langsung membaca database yang sama
            </p>
          </div>

          <button
            onClick={handleCopyVercelEnv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            {copiedVercelEnv ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedVercelEnv ? 'Kredensial Vercel Disalin!' : 'Salin Nilai Env Vercel'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-slate-300 space-y-2">
          <div><span className="text-cyan-400">VITE_SUPABASE_URL</span>={supabaseUrl || 'https://xxxxxxxxxxxxxxxx.supabase.co'}</div>
          <div><span className="text-cyan-400">VITE_SUPABASE_ANON_KEY</span>={supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'eyJhbGciOi...'}</div>
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

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={getSupabaseProjectRef() 
                ? `https://supabase.com/dashboard/project/${getSupabaseProjectRef()}/sql/new`
                : 'https://supabase.com/dashboard'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Buka SQL Editor Supabase</span>
            </a>

            <button
              onClick={handleCopySQL}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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


