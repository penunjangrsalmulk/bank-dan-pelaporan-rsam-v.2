import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  HeroSection 
} from './components/HeroSection';
import { 
  InternalAppsSection 
} from './components/InternalAppsSection';
import { 
  OfficialAppsSection 
} from './components/OfficialAppsSection';
import { 
  StatisticsSection 
} from './components/StatisticsSection';
import { 
  HospitalProfileSection 
} from './components/HospitalProfileSection';
import { 
  Footer 
} from './components/Footer';
import { 
  AppDetailModal 
} from './components/AppDetailModal';
import { 
  AdminLogin 
} from './components/Admin/AdminLogin';
import { 
  AdminLayout 
} from './components/Admin/AdminLayout';
import { 
  WebsiteProfile, 
  SocialLink, 
  HeroMedia, 
  InternalApplication, 
  OfficialReportingApp, 
  ApplicationClick, 
  AuditLog, 
  AppUser 
} from './types/database';
import { 
  getWebsiteProfile, 
  getSocialLinks, 
  getHeroMedia, 
  getInternalApplications, 
  getOfficialApplications, 
  getApplicationClicks, 
  getAuditLogs, 
  recordApplicationClick, 
  subscribeToDataChanges 
} from './services/databaseService';
import { 
  getCurrentUser 
} from './lib/auth';
import { 
  INITIAL_PROFILE 
} from './services/seedData';
import { 
  Building2 
} from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'login'>('public');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [profile, setProfile] = useState<WebsiteProfile>(INITIAL_PROFILE);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([]);
  const [internalApps, setInternalApps] = useState<InternalApplication[]>([]);
  const [officialApps, setOfficialApps] = useState<OfficialReportingApp[]>([]);
  const [clicks, setClicks] = useState<ApplicationClick[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modal detail states
  const [selectedApp, setSelectedApp] = useState<InternalApplication | OfficialReportingApp | null>(null);
  const [selectedAppType, setSelectedAppType] = useState<'internal' | 'official'>('internal');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load all initial data
  const loadData = useCallback(async () => {
    try {
      const [
        p,
        links,
        media,
        internals,
        officials,
        clickLogs,
        audits,
        user
      ] = await Promise.all([
        getWebsiteProfile(),
        getSocialLinks(),
        getHeroMedia(),
        getInternalApplications(),
        getOfficialApplications(),
        getApplicationClicks(),
        getAuditLogs(),
        getCurrentUser()
      ]);

      setProfile(p);
      setSocialLinks(links);
      setHeroMedia(media);
      setInternalApps(internals);
      setOfficialApps(officials);
      setClicks(clickLogs);
      setAuditLogs(audits);
      setCurrentUser(user);

      // Check slug from pathname or hash if on initial load (e.g. /app/sipakar-almulk or #/app/sipakar-almulk)
      const path = window.location.pathname;
      const hash = window.location.hash;
      const combinedPath = path + hash;

      if (combinedPath.includes('/app/')) {
        const slug = combinedPath.split('/app/')[1]?.split('?')[0]?.replace('#', '');
        if (slug) {
          const matchedInternal = internals.find(a => a.slug === slug);
          if (matchedInternal) {
            setSelectedApp(matchedInternal);
            setSelectedAppType('internal');
            setShowDetailModal(true);
          } else {
            const matchedOfficial = officials.find(a => a.slug === slug);
            if (matchedOfficial) {
              setSelectedApp(matchedOfficial);
              setSelectedAppType('official');
              setShowDetailModal(true);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChanges(() => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Open modal
  const handleOpenDetail = (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => {
    setSelectedApp(app);
    setSelectedAppType(type);
    setShowDetailModal(true);
    // Push state to browser history for SEO / direct links
    try {
      window.history.pushState(null, '', `/app/${app.slug}`);
    } catch (e) {
      // Fallback
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedApp(null);
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      // Fallback
    }
  };

  // Launch application handler
  const handleLaunchApp = async (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => {
    // Record click asynchronously
    recordApplicationClick(app.id, type, app.name, currentUser?.email);

    // Open target securely in new tab
    if (app.app_url) {
      window.open(app.app_url, '_blank', 'noopener,noreferrer');
    }
  };

  const totalClicksCount = internalApps.reduce((acc, a) => acc + (a.click_count || 0), 0) +
    officialApps.reduce((acc, a) => acc + (a.click_count || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-700 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4 animate-pulse">
          <Building2 className="w-8 h-8 text-slate-950" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          BANK APLIKASI DAN PELAPORAN
        </h2>
        <p className="text-xs text-cyan-400 font-mono mt-1">
          RSUD AL-MULK KOTA SUKABUMI
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Memuat ekosistem digital rumah sakit...</span>
        </div>
      </div>
    );
  }

  // Admin Login View
  if (currentView === 'login') {
    return (
      <AdminLogin
        onSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView('admin');
        }}
        onBackToPublic={() => setCurrentView('public')}
      />
    );
  }

  // Admin Dashboard / Manager View
  if (currentView === 'admin') {
    return (
      <AdminLayout
        currentUser={currentUser}
        profile={profile}
        socialLinks={socialLinks}
        heroMedia={heroMedia}
        internalApps={internalApps}
        officialApps={officialApps}
        clicks={clicks}
        auditLogs={auditLogs}
        onBackToPublic={() => setCurrentView('public')}
        onRefreshData={loadData}
        onUpdateProfile={(p) => setProfile(p)}
        onUpdateSocialLinks={(s) => setSocialLinks(s)}
        onUpdateHeroMedia={(h) => setHeroMedia(h)}
      />
    );
  }

  // Public Landing Page View
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Ambient Frosted Glass Glow Orbs */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-blue-800/15 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-sky-900/10 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* Fixed Glassmorphism Top Navigation Bar */}
      <Navbar
        profile={profile}
        socialLinks={socialLinks}
        currentUser={currentUser}
        currentView={currentView}
        onNavigateView={(v) => setCurrentView(v as any)}
        onOpenLogin={() => setCurrentView('login')}
        onOpenAdmin={() => setCurrentView('admin')}
      />

      {/* Main Content Sections */}
      <main className="flex-1 relative z-10">

        
        {/* 1. Hero Section with Media Slideshow, Spotlight & Live Counters */}
        <HeroSection
          profile={profile}
          socialLinks={socialLinks}
          heroMedia={heroMedia}
          internalApps={internalApps}
          officialApps={officialApps}
          onOpenDetail={handleOpenDetail}
          onLaunchApp={handleLaunchApp}
        />

        {/* 2. Internal Applications Section (SIMRS, SIPAKAR, Pelayanan, Inovasi RSUD) */}
        <InternalAppsSection
          applications={internalApps}
          onOpenDetail={handleOpenDetail}
          onLaunchApp={handleLaunchApp}
        />

        {/* 3. Official Reporting Section (Kemenkes, BPJS, Dinkes - Distinct System Theme) */}
        <OfficialAppsSection
          applications={officialApps}
          onOpenDetail={handleOpenDetail}
          onLaunchApp={handleLaunchApp}
        />

        {/* 4. Real-time Ecosystem Statistics */}
        <StatisticsSection
          internalCount={internalApps.length}
          officialCount={officialApps.length}
          totalClicks={totalClicksCount}
        />

        {/* 5. Hospital Official Identity & Contact Section */}
        <HospitalProfileSection
          profile={profile}
        />

      </main>

      {/* Footer with Comprehensive Links, Socials & Credits */}
      <Footer
        profile={profile}
        socialLinks={socialLinks}
        currentUser={currentUser}
        onOpenLogin={() => setCurrentView('login')}
        onOpenAdmin={() => setCurrentView('admin')}
      />

      {/* Dynamic Detail Modal for Single Application (/app/[slug]) */}
      {showDetailModal && (
        <AppDetailModal
          app={selectedApp}
          type={selectedAppType}
          onClose={handleCloseDetail}
          onLaunch={handleLaunchApp}
        />
      )}

    </div>
  );
}

export default App;
