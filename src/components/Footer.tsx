import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Lock,
  ArrowUp,
  ExternalLink,
  PhoneCall,
  Clock
} from 'lucide-react';
import { WebsiteProfile, SocialLink, AppUser } from '../types/database';
import { SocialLinksBar } from './SocialLinksBar';

interface FooterProps {
  profile: WebsiteProfile;
  socialLinks: SocialLink[];
  currentUser: AppUser | null;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  socialLinks,
  currentUser,
  onOpenLogin,
  onOpenAdmin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#01040f] border-t border-white/10 text-slate-400 pt-16 pb-10 relative z-10">
      
      {/* Top Floating Scroll Up Button */}
      <button
        onClick={scrollToTop}
        title="Kembali ke atas"
        className="absolute -top-5 right-8 sm:right-16 w-11 h-11 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-cyan-400/40 transition-all hover:-translate-y-1 cursor-pointer"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <div className="w-full max-w-[1600px] 2xl:max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Main 4-Column Grid on Desktop Widescreen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand, Address & Social Media Links (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-bold shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-wide text-white">
                  {profile.hospital_name || 'RSUD AL-MULK KOTA SUKABUMI'}
                </h3>
                <p className="text-[11px] text-cyan-400 font-bold tracking-wider uppercase">
                  Bank Aplikasi & Sistem Pelaporan Resmi
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Portal terpadu satu pintu untuk seluruh aplikasi operasional internal rumah sakit dan sistem pelaporan regulasi pemerintah di lingkungan RSUD Al-Mulk Kota Sukabumi.
            </p>

            {/* Social Media Channels */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
                Kanal Resmi Media Sosial & Pengaduan:
              </div>
              <SocialLinksBar links={socialLinks} variant="dark" />
            </div>

            {/* Emergency Hotline in Footer */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-white max-w-md">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase text-rose-300">IGD 24 JAM & Gawat Darurat</div>
                  <div className="text-xs font-bold text-white font-mono">{profile.emergency_phone || '(0266) 243225'}</div>
                </div>
              </div>
              <a
                href={`tel:${profile.emergency_phone?.replace(/[^0-9]/g, '') || '0266243225'}`}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors shrink-0"
              >
                Panggil IGD
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={scrollToTop} 
                  className="hover:text-cyan-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                  <span>Beranda Hero</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-aplikasi-internal')} 
                  className="hover:text-cyan-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                  <span>Aplikasi Internal</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-pelaporan-resmi')} 
                  className="hover:text-cyan-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  <span>Pelaporan Resmi</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('section-statistik')} 
                  className="hover:text-cyan-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                  <span>Statistik Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Systems Summary (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Sistem Terpadu
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>SIPAKAR Penunjang</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>SIMRS Khanza RSUD</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>SIRS Online Kemenkes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>SISRUTE Nasional</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>BPJS V-Claim & SEP</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contacts & Hospital Address (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Alamat & Kontak Resmi
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {profile.address || 'Jl. Pelabuhan II No. 175, Cikondang, Kec. Citamiang, Kota Sukabumi, Jawa Barat 43142'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono">{profile.phone || '(0266) 243224'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{profile.email || 'info@rsudalmulk.sukabumikota.go.id'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{profile.service_hours || 'IGD 24 Jam • Poli: 07.30 - 14.00'}</span>
              </div>
            </div>

            <div className="pt-2">
              {currentUser ? (
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold border border-cyan-400/30 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Panel Administrasi
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Login Administrator
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Copyright & System Info Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 <strong>RSUD AL-MULK KOTA SUKABUMI</strong>. Pemerintah Daerah Kota Sukabumi.
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>Bank Aplikasi dan Pelaporan v2.0 • Resolusi Optimal 1920x1080</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
