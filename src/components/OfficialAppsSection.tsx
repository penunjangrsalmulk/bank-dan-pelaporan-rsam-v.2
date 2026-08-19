import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  ShieldCheck, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  AlertCircle
} from 'lucide-react';
import { OfficialReportingApp, InternalApplication } from '../types/database';
import { ApplicationCard } from './ApplicationCard';

interface OfficialAppsSectionProps {
  applications: OfficialReportingApp[];
  onOpenDetail: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
  onLaunchApp: (app: InternalApplication | OfficialReportingApp, type: 'internal' | 'official') => void;
}

export const OfficialAppsSection: React.FC<OfficialAppsSectionProps> = ({
  applications,
  onOpenDetail,
  onLaunchApp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('Semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [sortBy, setSortBy] = useState<'featured' | 'popular' | 'newest' | 'alphabetical'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Standard institutions
  const standardInstitutions = [
    'Semua',
    'Kementerian Kesehatan RI',
    'BPJS Kesehatan',
    'Dinas Kesehatan Kota Sukabumi',
    'Dinas Kesehatan Provinsi Jawa Barat',
    'Kementerian / Lembaga Lain'
  ];

  // Dynamic institutions from data
  const institutions = useMemo(() => {
    const list = [...standardInstitutions];
    applications.forEach(app => {
      if (app.institution && !list.includes(app.institution)) {
        list.push(app.institution);
      }
    });
    return list;
  }, [applications]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => { if (a.category) set.add(a.category); });
    return ['Semua', ...Array.from(set).sort()];
  }, [applications]);

  // Filter & Sort
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        const q = searchQuery.toLowerCase();
        const matchQuery = 
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.institution.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q) ||
          app.slug.toLowerCase().includes(q);

        if (!matchQuery) return false;

        if (selectedInstitution !== 'Semua' && app.institution !== selectedInstitution) {
          return false;
        }

        if (selectedCategory !== 'Semua' && app.category !== selectedCategory) {
          return false;
        }

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
  }, [applications, searchQuery, selectedInstitution, selectedCategory, selectedStatus, sortBy]);

  return (
    <section id="section-pelaporan-resmi" className="py-16 sm:py-20 relative z-10">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              SISTEM PELAPORAN RESMI & NASIONAL
            </div>
            <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              PORTAL PELAPORAN-PELAPORAN RUMAH SAKIT TERPADU
            </h2>
          </div>

          {/* Right Action: View Switcher */}
          <div className="flex items-center gap-4">
            {/* Grid vs Table View Mode Switcher */}
            <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
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
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
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

        {/* Search & Secondary Filter Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl mb-8 space-y-4 shadow-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              id="search-official-apps"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari sistem pelaporan Kemenkes, BPJS, Dinkes (SIRS, V-Claim, ASPAK, SISRUTE, dll)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20 text-white text-xs sm:text-sm placeholder:text-slate-500 transition-all outline-none"
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

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar text-xs">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">Kategori:</span>
              {categories.map((cat) => (
                <button
                  key={`off-cat-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white border-emerald-400/40 shadow-sm shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="filter-official-status" className="text-slate-400 font-semibold shrink-0 text-xs">Status:</label>
                <select
                  id="filter-official-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <label htmlFor="sort-official-apps" className="text-slate-400 font-semibold shrink-0 text-xs">Urutkan:</label>
                <select
                  id="sort-official-apps"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-400 cursor-pointer"
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
                  type="official"
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
                  <thead className="bg-white/10 text-emerald-300 uppercase font-bold text-[11px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-5 py-4">Sistem & Pelaporan</th>
                      <th className="px-5 py-4">Instansi Pemilik</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Akses</th>
                      <th className="px-5 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.map((app) => (
                      <tr key={`tbl-off-${app.id}`} className="hover:bg-white/5 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white group-hover:text-emerald-300 flex items-center gap-2">
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
                        <td className="px-5 py-4 whitespace-nowrap text-slate-300 font-medium">
                          {app.institution}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[10px] uppercase">
                            {app.category}
                          </span>
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
                              onClick={() => onOpenDetail(app, 'official')}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-xs font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" />
                              Detail
                            </button>
                            <button
                              onClick={() => onLaunchApp(app, 'official')}
                              disabled={app.status === 'nonaktif'}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-40"
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
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto text-emerald-400 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Tidak Ada Sistem Ditemukan
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Tidak ada sistem pelaporan resmi yang sesuai dengan filter atau kata kunci yang dimasukkan.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedInstitution('Semua');
                setSelectedCategory('Semua');
                setSelectedStatus('Semua');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors cursor-pointer shadow-md"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
