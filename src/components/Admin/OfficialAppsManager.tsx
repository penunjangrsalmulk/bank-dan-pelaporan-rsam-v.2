import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Building2, 
  Tag,
  Upload,
  Image as ImageIcon,
  CloudUpload,
  Link as LinkIcon
} from 'lucide-react';
import { OfficialReportingApp, ApplicationStatus } from '../../types/database';
import { 
  saveOfficialApplication, 
  deleteOfficialApplication,
  uploadApplicationLogoFile,
  MAX_FILE_SIZE_BYTES
} from '../../services/databaseService';
import { isSafeUrl } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface OfficialAppsManagerProps {
  applications: OfficialReportingApp[];
  onUpdateSuccess: () => void;
  currentUserEmail?: string;
}

export const OfficialAppsManager: React.FC<OfficialAppsManagerProps> = ({
  applications,
  onUpdateSuccess,
  currentUserEmail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<OfficialReportingApp | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [institution, setInstitution] = useState('Kementerian Kesehatan RI');
  const [category, setCategory] = useState('Pelaporan Nasional');
  const [status, setStatus] = useState<ApplicationStatus>('aktif');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  // Logo upload states
  const [logoUploadMode, setLogoUploadMode] = useState<'upload' | 'url'>('upload');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const standardInstitutions = [
    'Kementerian Kesehatan RI',
    'BPJS Kesehatan',
    'Dinas Kesehatan Kota Sukabumi',
    'Dinas Kesehatan Provinsi Jawa Barat',
    'Kementerian / Lembaga Lain'
  ];

  const standardCategories = [
    'Pelaporan Rumah Sakit',
    'Jaminan Kesehatan',
    'Rujukan Nasional',
    'Rekam Medis Nasional',
    'SDM Kesehatan',
    'Kefarmasian & Alkes',
    'Regulasi & Akreditasi',
    'Pelaporan Daerah'
  ];

  // Dynamic distinct categories combining presets and user-entered categories
  const dynamicCategories = React.useMemo(() => {
    const set = new Set<string>(standardCategories);
    applications.forEach(a => {
      if (a.category && a.category.trim()) set.add(a.category.trim());
    });
    return Array.from(set);
  }, [applications]);

  // Dynamic distinct institutions combining presets and user-entered institutions
  const dynamicInstitutions = React.useMemo(() => {
    const set = new Set<string>(standardInstitutions);
    applications.forEach(a => {
      if (a.institution && a.institution.trim()) set.add(a.institution.trim());
    });
    return Array.from(set);
  }, [applications]);

  const openAddModal = () => {
    setEditingApp(null);
    setName('');
    setSlug('');
    setDescription('');
    setLogoUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop&q=80');
    setAppUrl('https://');
    setInstitution('Kementerian Kesehatan RI');
    setCategory('Pelaporan Rumah Sakit');
    setStatus('aktif');
    setIsFeatured(false);
    setDisplayOrder(applications.length + 1);
    setShowModal(true);
  };

  const openEditModal = (app: OfficialReportingApp) => {
    setEditingApp(app);
    setName(app.name);
    setSlug(app.slug);
    setDescription(app.description);
    setLogoUrl(app.logo_url);
    setAppUrl(app.app_url);
    setInstitution(app.institution);
    setCategory(app.category);
    setStatus(app.status);
    setIsFeatured(app.is_featured);
    setDisplayOrder(app.display_order);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingApp) {
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
        text: 'Logo pelaporan resmi siap disimpan.',
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
      const appToSave: OfficialReportingApp = {
        id: editingApp ? editingApp.id : `app-off-${Date.now()}`,
        name: name.trim(),
        slug: slug.trim() || `official-${Date.now()}`,
        description: description.trim(),
        logo_url: logoUrl.trim(),
        app_url: appUrl.trim(),
        institution,
        category,
        status,
        display_order: displayOrder,
        is_featured: isFeatured,
        click_count: editingApp ? editingApp.click_count : 0,
        created_at: editingApp ? editingApp.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await saveOfficialApplication(appToSave, currentUserEmail);
      onUpdateSuccess();
      setShowModal(false);

      Swal.fire({
        icon: 'success',
        title: editingApp ? 'Pelaporan Diperbarui' : 'Pelaporan Berhasil Ditambahkan',
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

  const handleDelete = async (app: OfficialReportingApp) => {
    const result = await Swal.fire({
      title: 'Hapus Pelaporan Resmi?',
      text: `Apakah Anda yakin ingin menghapus "${app.name}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await deleteOfficialApplication(app.id, currentUserEmail);
      onUpdateSuccess();
      Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: 'Sistem pelaporan telah berhasil dihapus.',
        timer: 1200,
        showConfirmButton: false
      });
    }
  };

  // Filtered List
  const filteredApps = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    const match = app.name.toLowerCase().includes(q) || app.institution.toLowerCase().includes(q) || app.category.toLowerCase().includes(q);
    if (!match) return false;
    if (selectedInstitution !== 'Semua' && app.institution !== selectedInstitution) return false;
    if (selectedStatus !== 'Semua' && app.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            SISTEM EKSTERNAL / RESMI
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Daftar Aplikasi Pelaporan Resmi Pemerintah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {applications.length} sistem nasional terhubung • Kemenkes RI, BPJS Kesehatan, dan Dinas Kesehatan
          </p>
        </div>

        <button
          id="btn-add-official-app"
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelaporan Resmi</span>
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
            placeholder="Cari pelaporan atau instansi..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Instansi:</span>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="Semua">Semua Instansi</option>
              {dynamicInstitutions.map(i => <option key={i} value={i}>{i}</option>)}
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
                <th className="px-6 py-4">Nama Sistem & Slug</th>
                <th className="px-6 py-4">Instansi Pemilik</th>
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
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden shrink-0 flex items-center justify-center">
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

                  {/* Institution */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {app.institution}
                    </span>
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
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Buka URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Pelaporan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Pelaporan"
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
                {editingApp ? 'Edit Sistem Pelaporan Resmi' : 'Tambah Sistem Pelaporan Resmi'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nama Sistem Pelaporan *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: SIRS Online Kemenkes RI"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-emerald-500 outline-none"
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
                  placeholder="sirs-online-kemenkes"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Deskripsi & Regulasi Terkait *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sistem Informasi Rumah Sakit Nasional untuk pelaporan data pelayanan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  URL Tujuan Portal Resmi (HTTPS/HTTP) *
                </label>
                <input
                  type="url"
                  required
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="https://sirs.kemkes.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Logo / Lambang Instansi (Maks. 5 MB) *
                  </label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLogoUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        logoUploadMode === 'upload' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        logoUploadMode === 'url' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
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
                          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 cursor-pointer disabled:opacity-50"
                        >
                          {uploadingLogo ? (
                            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-emerald-600" />
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                      />
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      Logo akan ditampilkan di kartu aplikasi pelaporan resmi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-700">
                      Instansi Pemilik *
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Bebas Ketik / Pilih
                    </span>
                  </div>

                  {/* Institution text input with datalist & preset picker */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="official-institutions-datalist"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ketik nama instansi atau pilih opsi..."
                        className="w-full pl-3.5 pr-28 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-emerald-500 focus:bg-white outline-none"
                      />

                      {/* Preset Quick Dropdown inside input */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) setInstitution(e.target.value);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 rounded-lg px-2 py-1 outline-none border-0 cursor-pointer"
                        title="Pilih dari rekomendasi instansi"
                      >
                        <option value="">Pilih Opsi ▾</option>
                        {dynamicInstitutions.map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    <datalist id="official-institutions-datalist">
                      {dynamicInstitutions.map(i => (
                        <option key={`dl-inst-${i}`} value={i} />
                      ))}
                    </datalist>

                    {/* Quick suggestion tags for institutions */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Cepat:</span>
                      {standardInstitutions.map(i => {
                        const shortLabel = i.replace('Kementerian Kesehatan RI', 'Kemenkes RI')
                                            .replace('Dinas Kesehatan Kota Sukabumi', 'Dinkes Kota')
                                            .replace('Dinas Kesehatan Provinsi Jawa Barat', 'Dinkes Jabar')
                                            .replace('Kementerian / Lembaga Lain', 'Lainnya');
                        return (
                          <button
                            key={`sug-inst-${i}`}
                            type="button"
                            onClick={() => setInstitution(i)}
                            className={`text-[10px] px-2 py-0.5 rounded-md transition-all shrink-0 cursor-pointer border ${
                              institution === i 
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold' 
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200'
                            }`}
                          >
                            {shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-700">
                      Kategori Pelaporan *
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Bebas Ketik / Pilih
                    </span>
                  </div>
                  
                  {/* Category text input with datalist & preset picker */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="official-categories-datalist"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ketik kategori atau pilih opsi..."
                        className="w-full pl-3.5 pr-28 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-emerald-500 focus:bg-white outline-none"
                      />
                      
                      {/* Preset Quick Dropdown inside input */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) setCategory(e.target.value);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 rounded-lg px-2 py-1 outline-none border-0 cursor-pointer"
                        title="Pilih dari rekomendasi kategori"
                      >
                        <option value="">Pilih Opsi ▾</option>
                        {dynamicCategories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <datalist id="official-categories-datalist">
                      {dynamicCategories.map(c => (
                        <option key={`dl-${c}`} value={c} />
                      ))}
                    </datalist>

                    {/* Quick suggestion tags */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Cepat:</span>
                      {standardCategories.slice(0, 4).map(c => (
                        <button
                          key={`sug-${c}`}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={`text-[10px] px-2 py-0.5 rounded-md transition-all shrink-0 cursor-pointer border ${
                            category === c 
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold' 
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-emerald-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured-off-checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500"
                />
                <label htmlFor="featured-off-checkbox" className="text-xs font-bold text-amber-900 cursor-pointer">
                  Jadikan Pelaporan Unggulan (Tampil Prioritas di Tab Atas)
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pelaporan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
