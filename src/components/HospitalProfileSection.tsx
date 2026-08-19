import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Globe, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  HeartHandshake,
  ExternalLink
} from 'lucide-react';
import { WebsiteProfile } from '../types/database';

interface HospitalProfileSectionProps {
  profile: WebsiteProfile;
}

export const HospitalProfileSection: React.FC<HospitalProfileSectionProps> = ({ profile }) => {
  return (
    <section id="section-profil-rs" className="py-16 sm:py-20 relative z-10">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            IDENTITAS RESMI
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-white tracking-tight">
            {profile.hospital_name || 'RSUD AL-MULK KOTA SUKABUMI'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1 font-medium italic">
            "{profile.tagline || 'Melayani dengan Hati, Ikhlas dan Profesional'}"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Hospital Overview & Digital Transformation in Frosted Glass */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl flex flex-col justify-between shadow-xl shadow-black/20">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 shrink-0">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white">
                    Transformasi Digital Kesehatan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Pusat Rujukan & Pelayanan Kesehatan Masyarakat Kota Sukabumi
                  </p>
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                RSUD Al-Mulk terus berkomitmen menghadirkan layanan prima yang mudah diakses, cepat, dan akuntabel. Melalui <strong className="text-cyan-400 font-semibold">Bank Aplikasi dan Pelaporan</strong> ini, seluruh unit faskes, dokter, perawat, staf manajemen, serta instansi pembina dapat mengakses seluruh ekosistem aplikasi rumah sakit dan sistem pelaporan nasional secara cepat dan terintegrasi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase">Rekam Medis Elektronik</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Integrasi SatuSehat & SIMRS Terpadu</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase">Pelayanan IGD 24 Jam</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Gawat Darurat & Rawat Inap siap siaga</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase">Pelaporan Nasional</h4>
                    <p className="text-xs text-slate-400 mt-0.5">SIRS, SISRUTE & BPJS Online</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase">Transparansi Publik</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Lapor-Mulk & Survei Kepuasan Pasien</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Banner */}
            <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-900/40 via-red-900/40 to-rose-950/40 border border-rose-500/40 text-white flex items-center justify-between gap-4 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse shrink-0" />
                <div>
                  <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-rose-200">
                    LAYANAN GAWAT DARURAT & IGD 24 JAM
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white font-mono">
                    {profile.emergency_phone || '(0266) 243225 / IGD 24 Jam'}
                  </div>
                </div>
              </div>
              <a
                href={`tel:${profile.emergency_phone?.replace(/[^0-9]/g, '') || '0266243225'}`}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors shrink-0"
              >
                Panggil IGD
              </a>
            </div>

          </div>

          {/* Right Column: Contact & Operational Details in Frosted Glass */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl flex flex-col justify-between shadow-xl shadow-black/20 text-white">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Informasi & Kontak Rumah Sakit
              </h3>

              <div className="space-y-4">
                
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Alamat Rumah Sakit</div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-snug">
                      {profile.address || 'Jl. Pelabuhan II No. 175, Cikondang, Kec. Citamiang, Kota Sukabumi, Jawa Barat 43142'}
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Telepon / Fax</div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-mono">
                      {profile.phone || '(0266) 243224'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Email Resmi</div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                      {profile.email || 'info@rsudalmulk.sukabumikota.go.id'}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Jam Pelayanan</div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-snug">
                      {profile.service_hours || 'IGD & Rawat Inap: 24 Jam | Poliklinik: Senin - Sabtu (07.30 - 14.00 WIB)'}
                    </p>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Website Utama</div>
                    <a 
                      href={profile.website_url || 'https://rsudalmulk.sukabumikota.go.id'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 underline mt-0.5 inline-flex items-center gap-1 font-semibold"
                    >
                      <span>{profile.website_url || 'https://rsudalmulk.sukabumikota.go.id'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400 text-center">
              Pemerintah Daerah Kota Sukabumi • Dinas Kesehatan Kota Sukabumi
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
