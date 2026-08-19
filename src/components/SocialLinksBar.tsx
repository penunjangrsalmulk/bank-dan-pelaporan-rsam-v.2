import React from 'react';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Video, 
  MessageCircle, 
  Globe, 
  Share2 
} from 'lucide-react';
import { SocialLink } from '../types/database';

interface SocialLinksBarProps {
  links: SocialLink[];
  variant?: 'light' | 'dark' | 'glass';
}

export const SocialLinksBar: React.FC<SocialLinksBarProps> = ({ 
  links, 
  variant = 'light' 
}) => {
  const activeLinks = links
    .filter(l => l.is_active && l.url && l.url.trim() !== '')
    .sort((a, b) => a.display_order - b.display_order);

  if (activeLinks.length === 0) return null;

  const getPlatformIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'tiktok':
        return <Video className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'website':
        return <Globe className="w-4 h-4" />;
      default:
        return <Share2 className="w-4 h-4" />;
    }
  };

  const getStyleClass = () => {
    switch (variant) {
      case 'dark':
        return 'bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border-white/10';
      case 'glass':
        return 'bg-white/15 hover:bg-white/30 text-white backdrop-blur-md border-white/20';
      case 'light':
      default:
        return 'bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {activeLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.title || link.platform}
          className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 hover:scale-110 shadow-xs ${getStyleClass()}`}
        >
          {getPlatformIcon(link.platform)}
        </a>
      ))}
    </div>
  );
};
