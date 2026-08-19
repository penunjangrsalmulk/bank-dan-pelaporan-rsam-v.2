import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  Building2, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  Info,
  UserCheck,
  Zap
} from 'lucide-react';
import { loginWithEmail } from '../../lib/auth';
import { AppUser } from '../../types/database';
import Swal from 'sweetalert2';

interface AdminLoginProps {
  onSuccess: (user: AppUser) => void;
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToPublic }) => {
  const [email, setEmail] = useState('penunjangrsam@gmail.com');
  const [password, setPassword] = useState('almulk2026');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const executeLogin = async (targetEmail: string, targetPass: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginWithEmail(targetEmail, targetPass);
      if (res.success && res.user) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: `Selamat datang kembali, ${res.user.name}`,
          timer: 1500,
          showConfirmButton: false
        });
        onSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Autentikasi gagal. Silakan coba lagi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Harap isi alamat email dan kata sandi.');
      return;
    }
    await executeLogin(email, password);
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('almulk2026');
    executeLogin(quickEmail, 'almulk2026');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      
      {/* Ambient background glowing orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-emerald-800/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between relative z-10">
        <button
          onClick={onBackToPublic}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portal Publik</span>
        </button>

        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Sistem Autentikasi Aktif
        </span>
      </div>

      {/* Login Card in Frosted Glass */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <Lock className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Panel Administrator
          </h2>
          <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase mt-1">
            RSUD AL-MULK KOTA SUKABUMI
          </p>
        </div>

        {/* Quick Instant 1-Click Access Buttons */}
        <div className="mb-6 space-y-2">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Login Instan 1-Klik (Rekomendasi):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('penunjangrsam@gmail.com')}
              disabled={loading}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-cyan-500/20 hover:from-cyan-600/50 hover:to-cyan-500/40 border border-cyan-500/30 text-left transition-all hover:scale-102 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-cyan-300 group-hover:text-white">Seksi Penunjang</span>
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-[10px] text-slate-400 truncate mt-1">penunjangrsam@gmail.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@almulk.go.id')}
              disabled={loading}
              className="p-3 rounded-xl bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 hover:from-emerald-600/50 hover:to-emerald-500/40 border border-emerald-500/30 text-left transition-all hover:scale-102 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-300 group-hover:text-white">Super Admin RS</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400 truncate mt-1">admin@almulk.go.id</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase tracking-widest font-mono">atau masukkan manual</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Alamat Email Administrator
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="penunjangrsam@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 text-white text-xs sm:text-sm placeholder:text-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 text-white text-xs sm:text-sm placeholder:text-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk ke Panel Admin</span>
              </>
            )}
          </button>
        </form>

      </div>

    </div>
  );
};
