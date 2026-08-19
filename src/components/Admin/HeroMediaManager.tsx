import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Layers, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  Sparkles,
  Sliders,
  Play,
  Upload,
  Link,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowUp,
  ArrowDown,
  Database,
  CloudUpload,
  X,
  FileVideo
} from 'lucide-react';
import { HeroMedia } from '../../types/database';
import { 
  saveHeroMedia, 
  deleteHeroMedia, 
  uploadHeroMediaFile, 
  readFileAsDataUrl,
  MAX_FILE_SIZE_BYTES 
} from '../../services/databaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface HeroMediaManagerProps {
  mediaList: HeroMedia[];
  onUpdateSuccess: (updated: HeroMedia[]) => void;
  currentUserEmail?: string;
}

export const HeroMediaManager: React.FC<HeroMediaManagerProps> = ({
  mediaList,
  onUpdateSuccess,
  currentUserEmail
}) => {
  const [items, setItems] = useState<HeroMedia[]>([...mediaList]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');

  // New media form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [newUrl, setNewUrl] = useState('');
  const [newOpacity, setNewOpacity] = useState(65);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSupabaseReady = isSupabaseConfigured();

  const handleToggleActive = (id: string) => {
    const updated = items.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m);
    setItems(updated);
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    const updated = items.map(m => m.id === id ? { ...m, overlay_opacity: opacity } : m);
    setItems(updated);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    const finalItems = reordered.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    setItems(finalItems);
  };

  const handleFileChange = async (file: File) => {
    // Check 5 MB maximum file size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({
        icon: 'error',
        title: 'Ukuran File Terlalu Besar',
        text: `Ukuran file ${(file.size / (1024 * 1024)).toFixed(2)} MB melebihi batas maksimal 5 MB. Silakan pilih foto atau video di bawah 5 MB.`
      });
      return;
    }

    setSelectedFile(file);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm');
    setNewType(isVideo ? 'video' : 'image');

    try {
      if (isVideo) {
        // Use object URL for fast video preview without freezing
        const objectUrl = URL.createObjectURL(file);
        setFilePreview(objectUrl);
      } else {
        const preview = await readFileAsDataUrl(file);
        setFilePreview(preview);
      }
    } catch (e) {
      console.warn('Preview generation notice:', e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Hapus Media Hero?',
      text: 'Media latar belakang ini akan dihapus dari portal dan database.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (res.isConfirmed) {
      await deleteHeroMedia(id, currentUserEmail);
      const updated = items.filter(m => m.id !== id);
      setItems(updated);
      onUpdateSuccess(updated);
      Swal.fire({ icon: 'success', title: 'Terhapus', timer: 1200, showConfirmButton: false });
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let createdMedia: HeroMedia;

      if (uploadTab === 'file' && selectedFile) {
        // Enforce 5MB limit
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
          throw new Error('Ukuran file melebihi batas maksimal 5 MB.');
        }

        createdMedia = await uploadHeroMediaFile(
          selectedFile,
          newTitle,
          newType,
          newOpacity,
          currentUserEmail
        );
      } else if (uploadTab === 'url' && newUrl) {
        const newItem: HeroMedia = {
          id: `hero-${Date.now()}`,
          title: newTitle || 'Media Hero RSUD Al-Mulk',
          media_type: newType,
          media_url: newUrl,
          thumbnail_url: newUrl,
          display_order: items.length + 1,
          is_active: true,
          overlay_opacity: newOpacity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const updated = [...items, newItem];
        await saveHeroMedia(updated, currentUserEmail);
        createdMedia = newItem;
      } else {
        Swal.fire({ icon: 'error', title: 'Perhatian', text: 'Harap pilih file (maks. 5 MB) atau masukkan URL media.' });
        setUploading(false);
        return;
      }

      const updated = [...items, createdMedia];
      setItems(updated);
      onUpdateSuccess(updated);
      setShowAddModal(false);
      resetForm();

      Swal.fire({
        icon: 'success',
        title: 'Media Berhasil Diunggah & Disimpan',
        text: `Media latar belakang ${newType.toUpperCase()} berhasil diterapkan ke portal.`,
        timer: 1800,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan Media', text: err.message || 'Terjadi kesalahan saat mengunggah.' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewUrl('');
    setSelectedFile(null);
    setFilePreview('');
    setNewOpacity(65);
    setUploadTab('file');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const saved = await saveHeroMedia(items, currentUserEmail);
      onUpdateSuccess(saved);
      Swal.fire({
        icon: 'success',
        title: 'Pengaturan Hero Tersimpan',
        text: 'Seluruh urutan dan konfigurasi media berhasil disinkronkan ke Supabase.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-5xl space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Pengelolaan Media Hero & Background
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              <CloudUpload className="w-3 h-3 text-cyan-600" />
              Maks. 5 MB Foto & Video
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah foto gedung RSUD Al-Mulk, fasilitas kesehatan, video cinematic MP4 (maks. 5 MB), dan atur efek visual hero secara langsung.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Unggah Media Baru</span>
        </button>
      </div>

      {/* Grid of Media Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((media, idx) => (
          <div 
            key={media.id}
            className={`rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
              media.is_active ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-100/60 border-slate-200/50 opacity-60'
            }`}
          >
            {/* Preview Banner */}
            <div className="relative h-44 bg-slate-900 overflow-hidden">
              {media.media_type === 'video' ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={media.media_url}
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <img 
                  src={media.media_url} 
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                  {media.media_type === 'video' ? <FileVideo className="w-3 h-3 text-cyan-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
                  #{idx + 1} {media.media_type}
                </span>
                {idx === 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Latar Utama
                  </span>
                )}
              </div>

              {/* Order Move & Active Action Buttons */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={() => handleMoveOrder(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white disabled:opacity-30 cursor-pointer transition-colors"
                  title="Pindah ke atas"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMoveOrder(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white disabled:opacity-30 cursor-pointer transition-colors"
                  title="Pindah ke bawah"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleToggleActive(media.id)}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    media.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                  title={media.is_active ? 'Media Aktif' : 'Media Nonaktif'}
                >
                  {media.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold drop-shadow-md truncate">
                {media.title}
              </div>
            </div>

            {/* Config controls */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    Overlay Opacity:
                  </span>
                  <span className="font-mono text-cyan-600">{media.overlay_opacity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={media.overlay_opacity}
                  onChange={(e) => handleOpacityChange(media.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]" title={media.media_url}>
                  {media.media_url.startsWith('data:') ? 'Tersimpan (Base64/Local DB)' : media.media_url}
                </span>

                <button
                  onClick={() => handleDelete(media.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Hapus media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save All Changes Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan ke Supabase...' : 'Simpan Semua Urutan & Pengaturan'}</span>
        </button>
      </div>

      {/* Add Media Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CloudUpload className="w-5 h-5 text-cyan-600" />
                  <span>Unggah Media Latar Hero</span>
                </h3>
                <p className="text-xs text-slate-500">Maksimal ukuran file foto / video: <strong>5 MB</strong></p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: File Upload vs Direct URL */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadTab === 'file' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah File (Maks. 5 MB)</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  uploadTab === 'url' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Masukkan Tautan URL</span>
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              
              {/* File Upload Zone */}
              {uploadTab === 'file' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih File Foto atau Video MP4 / WebM (Maks. 5 MB)
                  </label>
                  
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                      isDragOver 
                        ? 'border-cyan-500 bg-cyan-50/50' 
                        : selectedFile 
                          ? 'border-emerald-500 bg-emerald-50/30' 
                          : 'border-slate-300 hover:border-cyan-400 bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    {filePreview ? (
                      <div className="space-y-3 w-full">
                        <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-900 mx-auto">
                          {newType === 'video' ? (
                            <video
                              src={filePreview}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 px-2">
                          <span className="font-semibold text-emerald-700 truncate max-w-[200px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {selectedFile?.name}
                          </span>
                          <span className={`font-mono text-[11px] font-bold ${
                            (selectedFile?.size || 0) > MAX_FILE_SIZE_BYTES ? 'text-rose-600' : 'text-slate-500'
                          }`}>
                            {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB / 5 MB
                          </span>
                        </div>
                        <span className="text-[11px] text-cyan-600 font-semibold hover:underline">
                          Klik untuk mengganti file
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3">
                          <CloudUpload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Tarik dan lepas file foto atau video MP4 ke sini, atau klik untuk memilih
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">
                          Format: JPG, PNG, WEBP, MP4, WebM (Maksimal 5 MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* URL Input Field */
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Media Latar Belakang (HTTPS)
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              )}

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul / Keterangan Media
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Gedung Pelayanan Terpadu RSUD Al-Mulk"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Media Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipe Format Media
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewType('image')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      newType === 'image' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Foto / Gambar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('video')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      newType === 'video' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <VideoIcon className="w-3.5 h-3.5" />
                    <span>Video MP4 / WebM</span>
                  </button>
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Tingkat Kecerahan & Transparansi Overlay</span>
                  <span className="text-cyan-600 font-mono">{newOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={newOpacity}
                  onChange={(e) => setNewOpacity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={uploading}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan ke Supabase...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      <span>Simpan & Terapkan ke Hero</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
