import React, { useState } from 'react';
import { 
  Share2, 
  Save, 
  Instagram, 
  Facebook, 
  Youtube, 
  Video, 
  MessageCircle, 
  Globe, 
  Check, 
  Eye, 
  EyeOff,
  Plus
} from 'lucide-react';
import { SocialLink } from '../../types/database';
import { saveSocialLinks } from '../../services/databaseService';
import Swal from 'sweetalert2';

interface SocialLinksManagerProps {
  links: SocialLink[];
  onUpdateSuccess: (updated: SocialLink[]) => void;
  currentUserEmail?: string;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({
  links,
  onUpdateSuccess,
  currentUserEmail
}) => {
  const [linkList, setLinkList] = useState<SocialLink[]>([...links]);
  const [saving, setSaving] = useState(false);

  const handleUrlChange = (id: string, newUrl: string) => {
    setLinkList(linkList.map(l => l.id === id ? { ...l, url: newUrl } : l));
  };

  const handleToggleActive = (id: string) => {
    setLinkList(linkList.map(l => l.id === id ? { ...l, is_active: !l.is_active } : l));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveSocialLinks(linkList, currentUserEmail);
      onUpdateSuccess(saved);
      Swal.fire({
        icon: 'success',
        title: 'Tautan Sosial Berhasil Disimpan',
        timer: 1800,
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

  const getIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-600" />;
      case 'tiktok': return <Video className="w-5 h-5 text-slate-900" />;
      case 'whatsapp': return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      case 'website': return <Globe className="w-5 h-5 text-cyan-600" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl">
      
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Media Sosial & Kanal Komunikasi RSUD Al-Mulk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur tautan akun resmi yang tampil di header navigasi dan footer portal. Jika URL dikosongkan, ikon tidak akan muncul.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
          <Share2 className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4">
        {linkList.map((link) => (
          <div 
            key={link.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              link.is_active ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3.5 w-full sm:w-1/3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200 shrink-0">
                {getIcon(link.platform)}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                  {link.platform}
                </h4>
                <p className="text-[11px] text-slate-500">{link.title}</p>
              </div>
            </div>

            <div className="flex-1 w-full">
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleUrlChange(link.id, e.target.value)}
                placeholder={`https://${link.platform}.com/rsud_almulk...`}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:border-sky-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleToggleActive(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  link.is_active 
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {link.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{link.is_active ? 'Aktif' : 'Nonaktif'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all hover:scale-102 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Sosial'}</span>
        </button>
      </div>

    </div>
  );
};
