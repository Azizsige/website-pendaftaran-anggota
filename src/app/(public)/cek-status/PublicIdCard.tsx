"use client";

import React, { useEffect, useState } from 'react';
import { getSystemSettings } from '@/app/actions/setting-actions';
import { QrCode } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface PublicIdCardProps {
  userData: {
    name: string;
    nim: string;
    faculty: string;
    major: string;
    joinDate: Date;
    photoUrl?: string;
  };
}

export const PublicIdCard = ({ userData }: PublicIdCardProps) => {
  const [formData, setFormData] = useState<any>({});
  const [generalData, setGeneralData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSystemSettings();
        if (res.success && res.data) {
          const newFormData: any = {};
          const newGeneralData: any = {};
          res.data.forEach((s: any) => {
            if (s.key.startsWith('kta_')) {
              newFormData[s.key] = s.value;
            } else {
              newGeneralData[s.key] = s.value;
            }
          });
          
          // defaults
          if (!newFormData.kta_org_name) newFormData.kta_org_name = 'BEM FT UNSRI';
          if (!newFormData.kta_member_prefix) newFormData.kta_member_prefix = 'BEM-2026-';
          if (!newFormData.kta_validity_months) newFormData.kta_validity_months = '12';
          
          setFormData(newFormData);
          setGeneralData(newGeneralData);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  if (loading) {
    return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-[#006c49] border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-[#3c4a42]">Memuat ID Card...</p></div>;
  }

  let terms = [];
  try {
    if (formData.kta_terms) terms = JSON.parse(formData.kta_terms);
  } catch(e) {}

  const validityDate = addMonths(userData.joinDate || new Date(), parseInt(formData.kta_validity_months) || 12);
  const frontBgPreview = formData.kta_bg_front_url;
  const backBgPreview = formData.kta_bg_back_url;
  const signaturePreview = formData.kta_signature_url;
  const logoPreview = generalData.org_logo;

  const styles = `
    .security-pattern {
      background-image: 
        radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08) 0, transparent 35%),
        radial-gradient(circle at 0% 100%, rgba(30, 75, 153, 0.12) 0, transparent 40%),
        repeating-linear-gradient(45deg, rgba(15, 43, 92, 0.02) 0px, rgba(15, 43, 92, 0.02) 2px, transparent 2px, transparent 10px),
        repeating-linear-gradient(-45deg, rgba(245, 158, 11, 0.02) 0px, rgba(245, 158, 11, 0.02) 2px, transparent 2px, transparent 10px);
    }
    
    .hologram-strip {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.3) 0%, 
        rgba(254, 243, 199, 0.5) 25%, 
        rgba(219, 234, 254, 0.4) 50%, 
        rgba(254, 215, 170, 0.5) 75%, 
        rgba(255, 255, 255, 0.3) 100%);
    }

    .card-shadow {
      box-shadow: 0 25px 50px -12px rgba(11, 30, 63, 0.25), 0 0 0 1px rgba(11, 30, 63, 0.08);
    }
  `;

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center bg-transparent p-0">
      <style>{styles}</style>
      
      {/* Sisi Depan */}
      <div id="id-card-element" className="relative w-[380px] h-[605px] bg-white rounded-[24px] overflow-hidden card-shadow border border-slate-200/80 flex flex-col justify-between security-pattern select-none">
        {frontBgPreview && (
          <img src={frontBgPreview} alt="Front BG" className="absolute inset-0 w-full h-full object-cover z-0" />
        )}
          
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-200/80 border border-slate-300/60 z-30"></div>
          
          <div className="relative bg-gradient-to-r from-[#07162c] via-[#0b1e3f] to-[#0f2b5c] text-white pt-6 pb-4 px-6 rounded-b-[28px] shadow-md border-b-2 border-[#F59E0B] z-20">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-14 h-14 p-1 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex-shrink-0 shadow-inner flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain drop-shadow" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center font-bold text-white text-xl">L</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-300/30">
                    Resmi
                  </span>
                  <span className="text-[10px] tracking-wider text-slate-200 uppercase font-medium">{generalData.org_name || "Universitas Sriwijaya"}</span>
                </div>
                <h2 className="text-lg font-black tracking-tight leading-tight text-white mt-0.5">
                  {formData.kta_org_name || "BEM FT UNSRI"}
                </h2>
                <p className="text-[10px] font-semibold text-[#F59E0B] tracking-widest uppercase">
                  Kartu Tanda Anggota
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] font-mono font-bold text-white/90 bg-white/10 px-2 py-1 rounded-md border border-white/10">
                  2026/27
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 px-6 py-3 flex flex-col justify-between z-10 bg-white/80 backdrop-blur-[2px] mx-4 my-2 rounded-xl border border-white/40">
            <div className="flex gap-4 items-center pt-1">
              <div className="relative flex-shrink-0">
                {formData.kta_show_photo !== 'false' ? (
                  <div className="w-24 h-32 rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-[#F59E0B] via-amber-200 to-[#0b1e3f] shadow-md">
                    {userData.photoUrl ? (
                      <img src={userData.photoUrl} alt="Member" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-32"></div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-[#0b1e3f] text-amber-300 text-[8px] font-bold px-2 py-0.5 rounded-full border border-amber-400 shadow flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                  VERIFIED
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold tracking-widest text-[#0f2b5c] uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Anggota Aktif
                </span>
                {formData.kta_show_name !== 'false' && (
                  <h3 className={`font-extrabold text-[#07162c] tracking-tight mt-1 leading-snug truncate ${userData.name?.length > 18 ? 'text-sm' : 'text-base'}`} title={userData.name}>
                    {userData.name}
                  </h3>
                )}
                {formData.kta_show_major !== 'false' && (
                  <p className={`font-semibold text-[#153a7a] mt-0.5 truncate ${userData.major?.length > 22 ? 'text-[10px]' : 'text-xs'}`} title={userData.major}>
                    {userData.major}
                  </p>
                )}
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1">
                  {formData.kta_show_nim !== 'false' && (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-medium">NIM</span>
                      <span className="font-mono font-bold text-slate-800">{userData.nim}</span>
                    </div>
                  )}
                  {formData.kta_show_faculty !== 'false' && (
                    <div className="flex justify-between items-start text-[10px]">
                      <span className="text-slate-500 font-medium whitespace-nowrap mr-2">Fakultas</span>
                      <span className="font-bold text-slate-700 text-right leading-tight break-words">{userData.faculty}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 shadow-sm space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-2 text-left">
                <div>
                  <span className="block text-[9px] font-bold tracking-wider text-slate-600 uppercase">Nomor Anggota</span>
                  <span className="font-mono font-extrabold text-xs text-[#0b1e3f] tracking-tight">
                    {formData.kta_show_member_id !== 'false' ? `${formData.kta_member_prefix}${userData.nim?.slice(-4) || '0001'}` : '-'}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-wider text-slate-600 uppercase">Berlaku Hingga</span>
                  <span className="font-bold text-xs text-slate-800">
                    {formData.kta_show_validity !== 'false' ? format(validityDate, 'dd MMM yyyy') : '-'}
                  </span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-200/70 grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[9px] font-bold tracking-wider text-slate-600 uppercase">Status Keanggotaan</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pengurus Aktif
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-wider text-slate-600 uppercase">Divisi / Biro</span>
                  <span className="font-semibold text-[10px] text-slate-700 uppercase line-clamp-1">{userData.major || "Anggota"}</span>
                </div>
              </div>
            </div>
            
            <div className="h-1.5 w-full rounded-full hologram-strip border border-amber-300/40 my-1 shadow-sm"></div>
            
            <div className="flex items-center justify-between gap-3 pt-1">
              {formData.kta_show_qr !== 'false' ? (
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                    <QrCode size={48} className="text-slate-900" />
                  </div>
                  <div className="text-left">
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-[#0f2b5c] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                      <svg className="w-2 h-2 text-[#153a7a]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"></path></svg>
                      VALIDASI QR
                    </span>
                    <p className="text-[9px] font-medium text-slate-700 leading-tight mt-1 max-w-[150px]">
                      Scan untuk verifikasi anggota & akses portal resmi
                    </p>
                    <p className="text-[8px] font-mono text-slate-600 mt-0.5">
                      SEC-ID: {userData.nim?.slice(-4) || '0000'}A-{new Date().getFullYear().toString().slice(-2)}C
                    </p>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
              
              <div className="text-right flex flex-col items-end">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">PENGESAH</span>
                {signaturePreview ? (
                  <img src={signaturePreview} alt="Signature" className="h-7 w-auto object-contain -my-0.5 opacity-80" />
                ) : (
                  <div className="h-7"></div>
                )}
                <span className="text-[9px] font-extrabold text-slate-800">{formData.kta_signature_name || 'Nama Penanda Tangan'}</span>
                <span className="text-[7.5px] font-mono text-slate-600">NIM {userData.nim}</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F59E0B] via-[#0f2b5c] to-[#07162c] z-20"></div>
        </div>

      {/* Sisi Belakang */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between w-[380px] mb-1 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0b1e3f]"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Sisi Belakang</span>
          </div>
        </div>
        
        <div className="relative w-[380px] h-[605px] bg-white rounded-[24px] overflow-hidden card-shadow border border-slate-200/80 flex flex-col justify-between security-pattern select-none">
          {backBgPreview && (
            <img src={backBgPreview} alt="Back BG" className="absolute inset-0 w-full h-full object-cover z-0" />
          )}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-slate-200/80 border border-slate-300/60 z-30"></div>
          
          <div className="relative bg-gradient-to-r from-[#07162c] via-[#0b1e3f] to-[#0f2b5c] text-white pt-6 pb-4 px-6 rounded-b-[28px] shadow-md border-b-2 border-[#F59E0B] z-20">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 p-0.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  {logoPreview ? (
                    <img alt="Logo" className="w-8 h-8 object-contain" src={logoPreview} />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-white text-lg">L</div>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
                    {formData.kta_org_name || "BEM FT UNSRI"}
                  </h2>
                  <p className="text-[9px] font-medium text-amber-300 tracking-wider uppercase">
                    {generalData.org_name || "Fakultas Teknik Universitas Sriwijaya"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 px-6 pt-3 pb-5 flex flex-col justify-between z-10 bg-white/80 backdrop-blur-[2px] mx-4 my-3 rounded-xl border border-white/40">
            <div className="bg-slate-50/95 rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#0b1e3f] text-amber-300 flex items-center justify-center text-[10px] font-bold">
                    §
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#07162c]">
                    Ketentuan Kartu
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-slate-500 font-bold">REV-2026</span>
              </div>
              <ul className="space-y-1.5 text-[9px] text-slate-700 leading-snug font-medium">
                {terms.map((term: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-blue-100 text-[#0b1e3f] text-[8px] font-bold flex items-center justify-center mt-0.5">{index + 1}</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900 via-[#07162c] to-[#0b1e3f] rounded-2xl p-3.5 text-white shadow-sm border border-slate-700 relative overflow-hidden mt-4">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 opacity-10 pointer-events-none text-white">
                <svg fill="currentColor" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="white" strokeWidth="8"></circle>
                </svg>
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-300">Kontak Resmi</span>
                    <h5 className="text-[11px] font-bold text-white tracking-tight">{formData.kta_org_name || "Sekretariat BEM"}</h5>
                  </div>
                </div>
                <div className="space-y-1.5 text-[9px] text-slate-200 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                    <span className="truncate">{generalData?.org_address || 'Alamat Sekretariat'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                    <span className="font-mono text-[8.5px] text-slate-100 truncate">{generalData?.org_email || 'email@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-300">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                    <span className="font-mono text-[8.5px] text-amber-300 truncate">@{generalData?.org_instagram || 'instagram'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-2 mt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[8.5px] font-extrabold text-[#07162c] tracking-wide uppercase">
                  Kartu Tanda Anggota (KTA)
                </p>
                <p className="text-[7.5px] text-slate-500 font-medium">
                  Valid as official organization membership identification
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex flex-col items-end">
                  <div className="h-3.5 flex items-end gap-[1.5px] px-1 bg-white border border-slate-300 rounded">
                    <span className="w-[1px] h-3 bg-slate-900"></span>
                    <span className="w-[2px] h-2.5 bg-slate-900"></span>
                    <span className="w-[1px] h-3 bg-slate-900"></span>
                    <span className="w-[3px] h-3 bg-slate-900"></span>
                    <span className="w-[1px] h-2 bg-slate-900"></span>
                    <span className="w-[2px] h-3 bg-slate-900"></span>
                    <span className="w-[1px] h-2.5 bg-slate-900"></span>
                    <span className="w-[3px] h-3 bg-slate-900"></span>
                    <span className="w-[1px] h-2.5 bg-slate-900"></span>
                    <span className="w-[2px] h-3 bg-slate-900"></span>
                    <span className="w-[1px] h-2.5 bg-slate-900"></span>
                  </div>
                  <span className="text-[7px] font-mono text-slate-500 mt-0.5">UNSRI-KTA-PVC</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#07162c] via-[#0f2b5c] to-[#F59E0B] z-20"></div>
        </div>
      </div>
    </div>
  );
};
