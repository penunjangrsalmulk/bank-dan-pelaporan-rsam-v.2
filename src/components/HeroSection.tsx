import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowDown, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Activity, 
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
  Search,
  Zap,
  Building2,
  CheckCircle2,
  X
} from 'lucide-react';
import { WebsiteProfile, HeroMedia, InternalApplication, OfficialReportingApp, SocialLink } from '../types/database';

interface HeroSectionProps {
  profile: WebsiteProfile;
  socialLinks?: SocialLink[];
  heroMedia?: HeroMedia[];
  heroMediaList?: HeroMedia[];
  internalApps?: InternalApplication[];
  internalAppsCount?: number;
  officialApps?: OfficialReportingApp[];
  officialAppsCount?: number;
  onExploreClick?: () => void;
  onOfficialClick?: () => void;
  onOpenDetail?: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
  onLaunchApp?: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  heroMedia = [],
  heroMediaList = [],
  internalApps = [],
  internalAppsCount,
  officialApps = [],
  officialAppsCount,
  onExploreClick,
  onOfficialClick,
  onOpenDetail,
  onLaunchApp
}) => {
  const allMedia = heroMedia.length > 0 ? heroMedia : heroMediaList;
  const activeMedia = allMedia.filter(m => m.is_active).sort((a, b) => a.display_order - b.display_order);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Slideshow auto-advance
  useEffect(() => {
    if (activeMedia.length <= 1 || !isPlayingSlideshow) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeMedia.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeMedia.length, isPlayingSlideshow]);

  const currentMedia = activeMedia[currentIndex] || allMedia[0];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Instant Quick Search Results
  const searchResults = useMemo(() => {
    if (!quickSearch.trim()) return [];
    const q = quickSearch.toLowerCase();
    
    const matchedInternals = internalApps
      .filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.unit && a.unit.toLowerCase().includes(q)))
      .map(a => ({ ...a, itemType: 'internal' as const }));

    const matchedOfficials = officialApps
      .filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.institution && a.institution.toLowerCase().includes(q)))
      .map(a => ({ ...a, itemType: 'official' as const }));

    return [...matchedInternals, ...matchedOfficials].slice(0, 6);
  }, [quickSearch, internalApps, officialApps]);

  const heroImageUrl = currentMedia?.media_url || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1920&auto=format&fit=crop&q=80';

  return (
    <section 
      id="hero-section" 
      className="relative min-h-[85vh] 2xl:min-h-[88vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden text-white"
    >
      {/* 1. Full-Color Vibrant Background Layer (No dark blue masking) */}
      <div className="absolute inset-0 z-0">
        {currentMedia?.media_type === 'video' ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover brightness-105 contrast-105 transition-all duration-1000"
            src={currentMedia.media_url}
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-1000 scale-105 filter brightness-100 saturate-125"
            style={{
              backgroundImage: `url('${heroImageUrl}')`
            }}
          />
        )}

        {/* Rich, Colorful Vibrant Aura Gradients (Emerald, Cyan, Sunlight Gold) */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/60 via-teal-900/40 to-cyan-950/60 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-slate-900/30 pointer-events-none" />
      </div>

      {/* 2. Vibrant Ambient Glow Highlights */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-[130px] pointer-events-none z-1" />
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-cyan-400/25 rounded-full blur-[130px] pointer-events-none z-1" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-sky-500/20 rounded-full blur-[150px] pointer-events-none z-1" />

      {/* 3. Main Centered Widescreen Hero Container */}
      <div className="relative z-10 w-full max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8">
        
        {/* Colorful Glowing Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-900/80 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 backdrop-blur-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/80" />
          <span className="text-xs font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200">
            PORTAL TERPUSAT APLIKASI-APLIKASI DAN PELAPORAN RUMAH SAKIT
          </span>
        </div>

        {/* Main Colorful Headline */}
        <div className="space-y-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          <h1 className="text-3xl sm:text-5xl 2xl:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-yellow-300 drop-shadow-md">
              ALMULK DIGITAL HUB
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-100 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md bg-slate-950/40 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            Satu Pintu Menuju Ekosistem Digital RSUD Al-Mulk
          </p>
        </div>

        {/* Interactive Colorful Live Search Bar */}
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-cyan-300 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => {
                setQuickSearch(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Cari cepat aplikasi (SIMRS, SIPAKAR, SIRS, BPJS, Rekam Medis)..."
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-slate-900/85 border-2 border-cyan-400/40 focus:border-emerald-400 focus:bg-slate-900/95 focus:ring-4 focus:ring-emerald-500/30 text-white text-sm placeholder:text-slate-300 backdrop-blur-2xl transition-all outline-none shadow-2xl"
            />
            {quickSearch && (
              <button
                onClick={() => {
                  setQuickSearch('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3.5 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instant Search Dropdown Results */}
          {showSearchResults && quickSearch.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#020617]/98 border-2 border-cyan-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl z-50 max-h-80 overflow-y-auto divide-y divide-white/10 text-left">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={`hero-res-${item.id}`}
                    className="p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        setShowSearchResults(false);
                        if (onOpenDetail) onOpenDetail(item as any, item.itemType);
                      }}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        item.itemType === 'internal' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      }`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-cyan-300 truncate">
                            {item.name}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${
                            item.itemType === 'internal' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {item.itemType === 'internal' ? 'Internal' : 'Pelaporan'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSearchResults(false);
                        if (onLaunchApp) onLaunchApp(item as any, item.itemType);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 shrink-0 cursor-pointer shadow-md transition-transform hover:scale-105 ${
                        item.itemType === 'internal' ? 'bg-gradient-to-r from-cyan-600 to-cyan-500' : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                      }`}
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-300">
                  Tidak ditemukan aplikasi dengan kata kunci "<strong className="text-white">{quickSearch}</strong>".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action Colorful Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            id="hero-explore-btn"
            onClick={() => onExploreClick ? onExploreClick() : scrollTo('section-aplikasi-internal')}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/30 border border-white/40 transition-all hover:scale-105 cursor-pointer group"
          >
            <Layers className="w-4 h-4 text-slate-950" />
            <span>DATABASE APLIKASI INTERNAL</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>

          <button
            id="hero-official-btn"
            onClick={() => onOfficialClick ? onOfficialClick() : scrollTo('section-pelaporan-resmi')}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider border border-emerald-400/40 shadow-xl shadow-emerald-600/30 backdrop-blur-md transition-all hover:scale-105 cursor-pointer group"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>APLIKASI PELAPORAN RESMI</span>
            <ArrowDown className="w-4 h-4 text-emerald-200 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

        {/* Media Slideshow Selector Dots */}
        {activeMedia.length > 1 && (
          <div className="flex items-center gap-3 pt-6 text-xs text-slate-300 bg-slate-950/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            {activeMedia.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx 
                    ? 'w-7 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-md shadow-cyan-400/50' 
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
            <button
              onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
              className="p-1 rounded-full text-slate-300 hover:text-white ml-2 cursor-pointer"
              title={isPlayingSlideshow ? 'Jeda Slideshow' : 'Putar Slideshow'}
            >
              {isPlayingSlideshow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
