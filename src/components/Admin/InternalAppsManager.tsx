import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Building, 
  Tag, 
  ArrowUpDown,
  SlidersHorizontal,
  Eye,
  Upload,
  Image as ImageIcon,
  CloudUpload,
  Link as LinkIcon
} from 'lucide-react';
import { InternalApplication, ApplicationStatus } from '../../types/database';
import { 
  saveInternalApplication, 
  deleteInternalApplication, 
  reorderInternalApplications,
  uploadApplicationLogoFile,
  MAX_FILE_SIZE_BYTES
} from '../../services/databaseService';
import { isSafeUrl } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface InternalAppsManagerProps {
  applications: InternalApplication[];
  onUpdateSuccess: () => void;
  currentUserEmail?: string;
}

export const InternalAppsManager: React.FC<InternalAppsManagerProps> = ({
  applications,
  onUpdateSuccess,
  currentUserEmail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<InternalApplication | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [category, setCategory] = useState('Pelayanan Medis dan Keperawatan');
  const [unit, setUnit] = useState('Instalasi TI & SIMRS');
  const [status, setStatus] = useState<ApplicationStatus>('aktif');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  // Logo upload states
  const [logoUploadMode, setLogoUploadMode] = useState<'upload' | 'url'>('upload');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Pelayanan Medis dan Keperawatan',
    'Pelayanan Penunjang',
    'Penatausahaan, Kepegawaian, Perencanaan, dan Keuangan'
  ];

  const standardUnits = [
    'Seksi Penunjang RS',
    'Instalasi TI & SIMRS',
    'Instalasi Farmasi',
    'Komite Mutu & Keselamatan Pasien',
    'Subbag Kepegawaian & Tata Usaha',
    'Gudang Farmasi & Logistik',
    'Humas & Pengaduan',
    'Admission & Rawat Inap',
    'Bagian Tata Usaha',
    'Instalasi Rawat Jalan',
    'Instalasi Gawat Darurat (IGD)',
    'Instalasi Rekam Medis'
  ];

  const openAddModal = () => {
    setEditingApp(null);
    setName('');
    setSlug('');
    setDescription('');
    setLogoUrl('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&auto=format&fit=crop&q=80');
    setAppUrl('https://');
    setCategory('Pelayanan Medis dan Keperawatan');
    setUnit('Seksi Penunjang RS');
    setStatus('aktif');
    setIsFeatured(false);
    setDisplayOrder(applications.length + 1);
    setShowModal(true);
  };

  const openEditModal = (app: InternalApplication) => {
    setEditingApp(app);
    setName(app.name);
    setSlug(app.slug);
    setDescription(app.description);
    setLogoUrl(app.logo_url);
    setAppUrl(app.app_url);
    setCategory(app.category);
    setUnit(app.unit);
    setStatus(app.status);
    setIsFeatured(app.is_featured);
    setDisplayOrder(app.display_order);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingApp) {
      // Auto slugify
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: `Ukuran logo (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 5 MB.`
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const uploadedUrl = await uploadApplicationLogoFile(file, currentUserEmail);
      setLogoUrl(uploadedUrl);
      Swal.fire({
        icon: 'success',
        title: 'Logo Berhasil Dimuat',
        text: 'Logo aplikasi siap disimpan.',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Logo',
        text: err.message || 'Terjadi kesalahan saat memproses logo.'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSafeUrl(appUrl)) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Tidak Aman',
        text: 'URL Aplikasi harus diawali dengan http:// atau https:// untuk keamanan sistem.'
      });
      return;
    }

    setSaving(true);
    try {
      const appToSave: InternalApplication = {
        id: editingApp ? editingApp.id : `app-int-${Date.now()}`,
        name: name.trim(),
        slug: slug.trim() || `app-${Date.now()}`,
        description: description.trim(),
        logo_url: logoUrl.trim(),
        app_url: appUrl.trim(),
        category,
        unit,
        status,
        display_order: displayOrder,
        is_featured: isFeatured,
        click_count: editingApp ? editingApp.click_count : 0,
        created_at: editingApp ? editingApp.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await saveInternalApplication(appToSave, currentUserEmail);
      onUpdateSuccess();
      setShowModal(false);

      Swal.fire({
        icon: 'success',
        title: editingApp ? 'Aplikasi Diperbarui' : 'Aplikasi Berhasil Ditambahkan',
        text: `Data ${name} telah disimpan ke database.`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (app: InternalApplication) => {
    const result = await Swal.fire({
      title: 'Hapus Aplikasi Internal?',
      text: `Apakah Anda yakin ingin menghapus aplikasi "${app.name}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Aplikasi',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await deleteInternalApplication(app.id, currentUserEmail);
      onUpdateSuccess();
      Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: 'Aplikasi telah berhasil dihapus.',
        timer: 1200,
        showConfirmButton: false
      });
    }
  };

  // Filtered List
  const filteredApps = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    const match = app.name.toLowerCase().includes(q) || app.unit.toLowerCase().includes(q) || app.category.toLowerCase().includes(q);
    if (!match) return false;
    if (selectedCategory !== 'Semua' && app.category !== selectedCategory) return false;
    if (selectedStatus !== 'Semua' && app.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            PENGELOLAAN INTERNAL
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Daftar Aplikasi Internal RSUD Al-Mulk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {applications.length} sistem terdaftar • Kelola akses URL, logo, kategori, dan status operasional
          </p>
        </div>

        <button
          id="btn-add-internal-app"
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Aplikasi Internal</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aplikasi atau unit..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="maintenance">Maintenance</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Applications */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Urutan / Logo</th>
                <th className="px-6 py-4">Nama Aplikasi & Slug</th>
                <th className="px-6 py-4">Unit Pengelola</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Klik</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Order & Logo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono text-slate-400 font-bold">
                        #{app.display_order}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img 
                          src={app.logo_url} 
                          alt={app.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Name & Slug */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{app.name}</span>
                      {app.is_featured && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          ★ Unggulan
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      /{app.slug}
                    </div>
                  </td>

                  {/* Unit */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700">{app.unit}</span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {app.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {app.status === 'aktif' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif
                      </span>
                    )}
                    {app.status === 'maintenance' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Maintenance
                      </span>
                    )}
                    {app.status === 'nonaktif' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                        <XCircle className="w-3 h-3 text-rose-600" /> Nonaktif
                      </span>
                    )}
                  </td>

                  {/* Click counter */}
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">
                    {app.click_count || 0}x
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={app.app_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Buka URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Aplikasi"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Aplikasi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal Drawer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingApp ? 'Edit Aplikasi Internal RSUD Al-Mulk' : 'Tambah Aplikasi Internal Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nama Aplikasi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: SIPAKAR AL-MULK"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Slug URL Web (/app/[slug]) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="sipakar-almulk"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Deskripsi Fungsi Aplikasi *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sistem pelaporan kinerja seksi penunjang rumah sakit..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  URL Tujuan Aplikasi (HTTPS/HTTP) *
                </label>
                <input
                  type="url"
                  required
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="https://sipakar.rsudalmulk.sukabumikota.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-sky-500 outline-none"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Logo / Ikon Aplikasi (Maks. 5 MB) *
                  </label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLogoUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        logoUploadMode === 'upload' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        logoUploadMode === 'url' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Tautan URL
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {/* Logo Preview Container */}
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Preview Logo" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Upload Dropzone / URL Input */}
                  <div className="flex-1 min-w-0">
                    {logoUploadMode === 'upload' ? (
                      <div>
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                          className="hidden"
                          onChange={handleLogoFileSelect}
                        />
                        <button
                          type="button"
                          disabled={uploadingLogo}
                          onClick={() => logoFileInputRef.current?.click()}
                          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-sky-700 cursor-pointer disabled:opacity-50"
                        >
                          {uploadingLogo ? (
                            <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-sky-600" />
                          )}
                          <span>{uploadingLogo ? 'Mengunggah logo...' : 'Pilih / Unggah Logo (PNG, JPG, SVG maks 5MB)'}</span>
                        </button>
                      </div>
                    ) : (
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-sky-500 outline-none"
                      />
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      Logo akan ditampilkan di kartu aplikasi halaman utama.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Kategori Layanan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Unit Pengelola
                  </label>
                  <input
                    type="text"
                    list="units-list"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
                  />
                  <datalist id="units-list">
                    {standardUnits.map(u => <option key={u} value={u} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Status Operasional
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
                  >
                    <option value="aktif">Aktif (Dapat Diakses)</option>
                    <option value="maintenance">Maintenance (Pemeliharaan)</option>
                    <option value="nonaktif">Nonaktif (Disembunyikan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500"
                />
                <label htmlFor="featured-checkbox" className="text-xs font-bold text-amber-900 cursor-pointer">
                  Jadikan Aplikasi Unggulan (Tampil di Sorotan Spotlight Hero & Atas)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Aplikasi'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
