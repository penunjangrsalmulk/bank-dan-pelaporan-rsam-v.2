import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Share2, 
  Image, 
  Layers, 
  FileText, 
  TrendingUp, 
  Users, 
  ClipboardList, 
  Database, 
  LogOut, 
  Globe, 
  ChevronRight, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  AppUser, 
  WebsiteProfile, 
  SocialLink, 
  HeroMedia, 
  InternalApplication, 
  OfficialReportingApp, 
  ApplicationClick, 
  AuditLog 
} from '../../types/database';
import { logout } from '../../lib/auth';
import { AdminDashboard } from './AdminDashboard';
import { WebsiteProfileManager } from './WebsiteProfileManager';
import { SocialLinksManager } from './SocialLinksManager';
import { HeroMediaManager } from './HeroMediaManager';
import { InternalAppsManager } from './InternalAppsManager';
import { OfficialAppsManager } from './OfficialAppsManager';
import { AnalyticsManager } from './AnalyticsManager';
import { UserManagement } from './UserManagement';
import { AuditLogViewer } from './AuditLogViewer';
import { DatabaseSetupManager } from './DatabaseSetupManager';
import Swal from 'sweetalert2';

interface AdminLayoutProps {
  currentUser: AppUser | null;
  profile: WebsiteProfile;
  socialLinks: SocialLink[];
  heroMedia: HeroMedia[];
  internalApps: InternalApplication[];
  officialApps: OfficialReportingApp[];
  clicks: ApplicationClick[];
  auditLogs: AuditLog[];
  onBackToPublic: () => void;
  onRefreshData: () => void;
  onUpdateProfile: (p: WebsiteProfile) => void;
  onUpdateSocialLinks: (s: SocialLink[]) => void;
  onUpdateHeroMedia: (h: HeroMedia[]) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  profile,
  socialLinks,
  heroMedia,
  internalApps,
  officialApps,
  clicks,
  auditLogs,
  onBackToPublic,
  onRefreshData,
  onUpdateProfile,
  onUpdateSocialLinks,
  onUpdateHeroMedia
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [websiteMenuOpen, setWebsiteMenuOpen] = useState(true);
  const [appsMenuOpen, setAppsMenuOpen] = useState(true);

  const handleLogout = async () => {
    const res = await Swal.fire({
      title: 'Keluar dari Panel Admin?',
      text: 'Sesi administrasi Anda akan diakhiri.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal'
    });

    if (res.isConfirmed) {
      await logout();
      onBackToPublic();
    }
  };

  const navItemClass = (tab: string) => `
    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }
  `;

  const subNavItemClass = (tab: string) => `
    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer pl-7 ${
      activeTab === tab
        ? 'bg-sky-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
    }
  `;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black tracking-wider text-cyan-400 uppercase">
              ADMIN PORTAL
            </div>
            <div className="text-xs font-bold truncate max-w-[180px]">
              {profile.hospital_name || 'RSUD AL-MULK'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-700 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-wider uppercase text-cyan-400">
                PANEL ADMINISTRASI
              </div>
              <h1 className="text-xs font-bold text-white leading-snug truncate max-w-[160px]">
                RSUD AL-MULK
              </h1>
              <span className="text-[10px] font-mono text-slate-400 block">
                Kota Sukabumi
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
          
          {/* Main Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={navItemClass('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Dashboard Utama</span>
            </button>
          </div>

          {/* Group 1: Website Management */}
          <div>
            <button
              onClick={() => setWebsiteMenuOpen(!websiteMenuOpen)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 hover:text-slate-200"
            >
              <span>Pengaturan Website</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${websiteMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {websiteMenuOpen && (
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => { setActiveTab('website-profile'); setSidebarOpen(false); }}
                  className={subNavItemClass('website-profile')}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Profil & Identitas RS</span>
                </button>

                <button
                  onClick={() => { setActiveTab('social-links'); setSidebarOpen(false); }}
                  className={subNavItemClass('social-links')}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Media Sosial</span>
                </button>

                <button
                  onClick={() => { setActiveTab('hero-media'); setSidebarOpen(false); }}
                  className={subNavItemClass('hero-media')}
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>Hero & Media Latar</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 2: Applications Management */}
          <div>
            <button
              onClick={() => setAppsMenuOpen(!appsMenuOpen)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 hover:text-slate-200"
            >
              <span>Kelola Aplikasi</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${appsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {appsMenuOpen && (
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => { setActiveTab('internal-apps'); setSidebarOpen(false); }}
                  className={subNavItemClass('internal-apps')}
                >
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Aplikasi Internal RSUD</span>
                </button>

                <button
                  onClick={() => { setActiveTab('official-apps'); setSidebarOpen(false); }}
                  className={subNavItemClass('official-apps')}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pelaporan Resmi Instansi</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 3: Analytics & System */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
              Sistem & Analitik
            </div>

            <button
              onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
              className={navItemClass('analytics')}
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Analitik & Trafik Klik</span>
            </button>

            <button
              onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
              className={navItemClass('users')}
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Manajemen Akun / RBAC</span>
            </button>

            <button
              onClick={() => { setActiveTab('audit-log'); setSidebarOpen(false); }}
              className={navItemClass('audit-log')}
            >
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>Log Audit Sistem</span>
            </button>

            <button
              onClick={() => { setActiveTab('database-setup'); setSidebarOpen(false); }}
              className={navItemClass('database-setup')}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Database & SQL</span>
            </button>
          </div>

        </div>

        {/* User Footer & Switch to Public */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-cyan-700 text-white flex items-center justify-center font-black text-xs shrink-0">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Administrator RSAM'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || 'admin@rsudalmulk'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onBackToPublic}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Buka Halaman Publik"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Portal Publik</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-[11px] font-semibold border border-rose-800/40 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Render Active View */}
        {activeTab === 'dashboard' && (
          <AdminDashboard
            internalApps={internalApps}
            officialApps={officialApps}
            clicks={clicks}
            auditLogs={auditLogs}
            profile={profile}
            onNavigateTab={(t) => setActiveTab(t)}
            onAddNewInternal={() => setActiveTab('internal-apps')}
            onAddNewOfficial={() => setActiveTab('official-apps')}
          />
        )}

        {activeTab === 'website-profile' && (
          <WebsiteProfileManager
            profile={profile}
            onUpdateSuccess={onUpdateProfile}
            currentUserEmail={currentUser?.email}
          />
        )}

        {activeTab === 'social-links' && (
          <SocialLinksManager
            links={socialLinks}
            onUpdateSuccess={onUpdateSocialLinks}
            currentUserEmail={currentUser?.email}
          />
        )}

        {activeTab === 'hero-media' && (
          <HeroMediaManager
            mediaList={heroMedia}
            onUpdateSuccess={onUpdateHeroMedia}
            currentUserEmail={currentUser?.email}
          />
        )}

        {activeTab === 'internal-apps' && (
          <InternalAppsManager
            applications={internalApps}
            onUpdateSuccess={onRefreshData}
            currentUserEmail={currentUser?.email}
          />
        )}

        {activeTab === 'official-apps' && (
          <OfficialAppsManager
            applications={officialApps}
            onUpdateSuccess={onRefreshData}
            currentUserEmail={currentUser?.email}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsManager
            clicks={clicks}
            internalApps={internalApps}
            officialApps={officialApps}
          />
        )}

        {activeTab === 'users' && (
          <UserManagement
            currentUser={currentUser}
          />
        )}

        {activeTab === 'audit-log' && (
          <AuditLogViewer
            logs={auditLogs}
          />
        )}

        {activeTab === 'database-setup' && (
          <DatabaseSetupManager
            onDataReset={onRefreshData}
          />
        )}

      </main>

    </div>
  );
};
