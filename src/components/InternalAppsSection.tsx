import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  Sparkles, 
  Building, 
  SlidersHorizontal, 
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  MousePointerClick
} from 'lucide-react';
import { InternalApplication, OfficialReportingApp } from '../types/database';
import { ApplicationCard } from './ApplicationCard';

interface InternalAppsSectionProps {
  applications: InternalApplication[];
  onOpenDetail: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
  onLaunchApp: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
}

export const InternalAppsSection: React.FC<InternalAppsSectionProps> = ({
  applications,
  onOpenDetail,
  onLaunchApp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedUnit, setSelectedUnit] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [sortBy, setSortBy] = useState<'featured' | 'popular' | 'newest' | 'alphabetical'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract distinct categories and units
  const categories = useMemo(() => {
    const baseCategories = [
      'Semua',
      'Pelayanan Medis dan Keperawatan',
      'Pelayanan Penunjang',
      'Penatausahaan, Kepegawaian, Perencanaan, dan Keuangan'
    ];
    const otherCategories = new Set<string>();
    applications.forEach(a => {
      if (a.category && !baseCategories.includes(a.category)) {
        otherCategories.add(a.category);
      }
    });
    return [...baseCategories, ...Array.from(otherCategories).sort()];
  }, [applications]);

  const units = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => { if (a.unit) set.add(a.unit); });
    return ['Semua', ...Array.from(set).sort()];
  }, [applications]);

  // Filter and Sort Logic
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        // Search query
        const q = searchQuery.toLowerCase();
        const matchQuery = 
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q) ||
          app.unit.toLowerCase().includes(q) ||
          app.slug.toLowerCase().includes(q);

        if (!matchQuery) return false;

        // Category filter
        if (selectedCategory !== 'Semua' && app.category !== selectedCategory) {
          return false;
        }

        // Unit filter
        if (selectedUnit !== 'Semua' && app.unit !== selectedUnit) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'Semua' && app.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return a.display_order - b.display_order;
        }
        if (sortBy === 'popular') {
          return (b.click_count || 0) - (a.click_count || 0);
        }
        if (sortBy === 'alphabetical') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'newest') {
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        }
        return a.display_order - b.display_order;
      });
  }, [applications, searchQuery, selectedCategory, selectedUnit, selectedStatus, sortBy]);

  return (
    <section id="section-aplikasi-internal" className="py-16 sm:py-20 relative z-10">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              DATABASE APLIKASI INTERNAL
            </div>
            <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Katalog Aplikasi RSUD Al-Mulk
            </h2>
          </div>

          {/* Right Action: View Mode Switcher */}
          <div className="flex items-center gap-4">
            {/* Grid vs Table View Mode Switcher */}
            <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Database Tabel"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filter, and Sort Controls in Frosted Glass Container */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl mb-8 space-y-4 shadow-xl">
          
          {/* Top Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              id="search-internal-apps"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam database aplikasi (SIMRS, SIPAKAR, Farmasi, Kepegawaian, Bed, dll)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20 text-white text-xs sm:text-sm placeholder:text-slate-500 transition-all outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-white bg-white/10 px-2 py-1 rounded-md"
              >
                Reset
              </button>
            )}
          </div>

          {/* Filters and Sort Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-3 border-t border-white/5">
            
            {/* Category Filter Pills (Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" /> Kategori:
              </span>
              {categories.map((cat) => (
                <button
                  key={`cat-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdowns (Unit, Status & Sort) */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              
              {/* Unit Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="filter-internal-unit" className="text-slate-400 font-semibold shrink-0 text-xs">Unit Pengelola:</label>
                <select
                  id="filter-internal-unit"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {units.map((u) => (
                    <option key={`unit-${u}`} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="filter-internal-status" className="text-slate-400 font-semibold shrink-0 text-xs">Status:</label>
                <select
                  id="filter-internal-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="sort-internal-apps" className="text-slate-400 font-semibold shrink-0 text-xs">Urutkan:</label>
                <select
                  id="sort-internal-apps"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="featured">Unggulan & Urutan</option>
                  <option value="popular">Paling Sering Digunakan</option>
                  <option value="newest">Aplikasi Terbaru</option>
                  <option value="alphabetical">Nama (A - Z)</option>
                </select>
              </div>

            </div>

          </div>

        </div>

        {/* View Mode: Grid vs Database Table */}
        {filteredApps.length > 0 ? (
          viewMode === 'grid' ? (
            /* Widescreen 4-Column Grid on Desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
              {filteredApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  type="internal"
                  onOpenDetail={onOpenDetail}
                  onLaunchApp={onLaunchApp}
                />
              ))}
            </div>
          ) : (
            /* Database Table View */
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/10 text-cyan-300 uppercase font-bold text-[11px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-5 py-4">Aplikasi & Deskripsi</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4">Unit Kerja</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Akses</th>
                      <th className="px-5 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.map((app) => (
                      <tr key={`tbl-${app.id}`} className="hover:bg-white/5 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white group-hover:text-cyan-300 flex items-center gap-2">
                                <span>{app.name}</span>
                                {app.is_featured && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Unggulan
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1 max-w-md">
                                {app.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-cyan-300 border border-cyan-400/30 font-semibold text-[10px] uppercase">
                            {app.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-slate-300 font-medium">
                          {app.unit}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {app.status === 'aktif' && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              Aktif
                            </span>
                          )}
                          {app.status === 'maintenance' && (
                            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Maintenance
                            </span>
                          )}
                          {app.status === 'nonaktif' && (
                            <span className="text-rose-400 font-semibold">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                          {app.click_count || 0} klik
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onOpenDetail(app, 'internal')}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-xs font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" />
                              Detail
                            </button>
                            <button
                              onClick={() => onLaunchApp(app, 'internal')}
                              disabled={app.status === 'nonaktif'}
                              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-40"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3 inline ml-1" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white/5 rounded-2xl p-10 text-center border border-white/10 max-w-md mx-auto backdrop-blur-xl">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto text-cyan-400 mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Tidak Ada Aplikasi Ditemukan
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Tidak ada aplikasi internal yang sesuai dengan filter atau kata kunci yang dimasukkan.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedUnit('Semua');
                setSelectedStatus('Semua');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors cursor-pointer shadow-md"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
