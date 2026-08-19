import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  FileText, 
  BarChart3, 
  Info, 
  Lock, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { WebsiteProfile, SocialLink } from '../types/database';
import { AppUser } from '../types/database';

interface NavbarProps {
  profile: WebsiteProfile;
  socialLinks: SocialLink[];
  currentUser: AppUser | null;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  currentView: string;
  onNavigateView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  socialLinks,
  currentUser,
  onOpenLogin,
  onOpenAdmin,
  currentView,
  onNavigateView,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      onNavigateView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#020617]/90 backdrop-blur-2xl py-3 border-b border-white/10 shadow-xl shadow-black/40' 
          : 'bg-white/5 backdrop-blur-xl py-4 border-b border-white/10'
      }`}
    >
      <div className="w-full max-w-[1600px] 2xl:max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Name */}
          <button 
            id="nav-brand-logo"
            onClick={() => { onNavigateView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform text-white font-bold shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-wide leading-none text-white group-hover:text-cyan-300 transition-colors">
                {profile.hospital_name || 'RSUD AL-MULK'}
              </h1>
              <p className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase mt-1">
                Bank Aplikasi & Pelaporan
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-300">
            <button
              id="nav-link-home"
              onClick={() => { onNavigateView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`hover:text-cyan-300 transition-colors cursor-pointer ${
                currentView === 'home' ? 'text-cyan-400 font-extrabold' : ''
              }`}
            >
              Beranda
            </button>

            <button
              id="nav-link-internal"
              onClick={() => scrollToSection('section-aplikasi-internal')}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Aplikasi Internal
            </button>

            <button
              id="nav-link-official"
              onClick={() => scrollToSection('section-pelaporan-resmi')}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Pelaporan Resmi
            </button>

            <button
              id="nav-link-stats"
              onClick={() => scrollToSection('section-statistik')}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              Statistik
            </button>

            <button
              id="nav-link-about"
              onClick={() => scrollToSection('section-profil-rs')}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Profil & Kontak RS
            </button>
          </nav>

          {/* Right Action: Admin / User Button */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <button
                id="nav-admin-dashboard-btn"
                onClick={onOpenAdmin}
                className="flex items-center gap-2 text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-xl backdrop-blur-md border border-cyan-400/30 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all hover:scale-102 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </button>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider transition-all hover:scale-102 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Login Admin</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="sm:hidden px-4 pt-3 pb-6 bg-[#020617]/95 backdrop-blur-2xl border-b border-cyan-500/20 mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => { onNavigateView('home'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-white font-medium hover:bg-white/10"
          >
            Beranda
          </button>
          <button
            onClick={() => scrollToSection('section-aplikasi-internal')}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-cyan-300 font-medium hover:bg-white/10"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Aplikasi Internal
          </button>
          <button
            onClick={() => scrollToSection('section-pelaporan-resmi')}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-emerald-300 font-medium hover:bg-white/10"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            Pelaporan Resmi
          </button>
          <button
            onClick={() => scrollToSection('section-statistik')}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-200 font-medium hover:bg-white/10"
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            Statistik Portal
          </button>
          <button
            onClick={() => scrollToSection('section-profil-rs')}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-200 font-medium hover:bg-white/10"
          >
            <Info className="w-4 h-4 text-slate-300" />
            Profil & Kontak RS
          </button>

          <div className="pt-3 border-t border-white/10">
            {currentUser ? (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 text-white font-bold shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                Masuk ke Panel Admin
              </button>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium border border-white/20"
              >
                <Lock className="w-4 h-4 text-cyan-300" />
                Login Administrator
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
