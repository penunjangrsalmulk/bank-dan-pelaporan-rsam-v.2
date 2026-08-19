import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  ShieldAlert, 
  Check,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CloudUpload
} from 'lucide-react';
import { WebsiteProfile } from '../../types/database';
import { 
  updateWebsiteProfile, 
  uploadApplicationLogoFile, 
  MAX_FILE_SIZE_BYTES 
} from '../../services/databaseService';
import Swal from 'sweetalert2';

interface WebsiteProfileManagerProps {
  profile: WebsiteProfile;
  onUpdateSuccess: (updated: WebsiteProfile) => void;
  currentUserEmail?: string;
}

export const WebsiteProfileManager: React.FC<WebsiteProfileManagerProps> = ({
  profile,
  onUpdateSuccess,
  currentUserEmail
}) => {
  const [formData, setFormData] = useState<WebsiteProfile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMode, setLogoMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({
        icon: 'error',
        title: 'Ukuran File Terlalu Besar',
        text: `Ukuran logo (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 5 MB.`
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const uploadedUrl = await uploadApplicationLogoFile(file, currentUserEmail);
      setFormData(prev => ({ ...prev, logo_url: uploadedUrl }));
      Swal.fire({
        icon: 'success',
        title: 'Logo RS Berhasil Dimuat',
        text: 'Logo siap disimpan ke profil website.',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunggah Logo',
        text: err.message || 'Terjadi kesalahan saat memproses file logo.'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateWebsiteProfile(formData, currentUserEmail);
      onUpdateSuccess(updated);
      Swal.fire({
        icon: 'success',
        title: 'Profil Berhasil Disimpan',
        text: 'Data identitas RSUD Al-Mulk telah diperbarui.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl">
      
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Profil & Identitas Website RSUD Al-Mulk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi nama faskes, logo resmi, alamat, jam pelayanan, dan kontak
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Hospital Name & Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Resmi Rumah Sakit *
            </label>
            <input
              type="text"
              required
              value={formData.hospital_name}
              onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Motto / Tagline Pelayanan
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Contoh: Melayani dengan Hati, Ikhlas dan Profesional"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Deskripsi Portal Terpadu *
          </label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
          />
        </div>

        {/* Logo Upload with Dual Mode & Live Preview */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Logo Resmi Rumah Sakit (Maks. 5 MB) *
            </label>
            <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLogoMode('upload')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  logoMode === 'upload' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unggah File
              </button>
              <button
                type="button"
                onClick={() => setLogoMode('url')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  logoMode === 'url' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tautan URL
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Logo Preview Box */}
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Logo RS" 
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {logoMode === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-cyan-300 hover:border-cyan-500 bg-white hover:bg-cyan-50/50 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-cyan-700 cursor-pointer disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-cyan-600" />
                    )}
                    <span>{uploadingLogo ? 'Mengunggah logo...' : 'Pilih File Logo (PNG, JPG, SVG maks. 5 MB)'}</span>
                  </button>
                </div>
              ) : (
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:border-cyan-500 outline-none"
                />
              )}
              <p className="text-[10px] text-slate-400 mt-1">
                Logo ini akan ditampilkan di header navigasi, hero section, dan footer portal.
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Alamat Fisik RSUD Al-Mulk *
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor Telepon Resmi *
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              WhatsApp Layanan / Pengaduan
            </label>
            <input
              type="text"
              value={formData.whatsapp || ''}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Resmi *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Jam Operasional Pelayanan
            </label>
            <input
              type="text"
              value={formData.operating_hours || ''}
              onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
              placeholder="IGD & Rawat Inap: 24 Jam | Poliklinik: 08.00 - 14.00"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Teks Hak Cipta Footer
            </label>
            <input
              type="text"
              value={formData.copyright_text || ''}
              onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan Profil...' : 'Simpan Profil Website'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
