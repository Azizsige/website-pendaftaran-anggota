import React, { useRef } from 'react';
import { useIdCardSettingStore } from '@/store/useIdCardSettingStore';
import { Upload, X } from 'lucide-react';

export const IdCardSignatureSection = () => {
  const { formData, signaturePreview, handleSignatureUpload, handleChange } = useIdCardSettingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSignatureUpload(file);
  };

  const removeSignature = () => {
    handleChange('kta_signature_url', '');
    useIdCardSettingStore.setState({ signaturePreview: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-on-surface">Tanda Tangan Pengesah</h3>
      <p className="text-sm text-on-surface-variant">Upload gambar tanda tangan (disarankan format PNG dengan background transparan) dan masukkan nama penanda tangan.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
        {/* Upload Tanda Tangan */}
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Gambar Tanda Tangan</label>
          <div className="flex items-start gap-4">
            <div 
              className={`w-[160px] h-[80px] rounded-lg border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-colors ${signaturePreview ? 'border-primary bg-primary/5' : 'border-outline-variant/40 bg-surface-container-low hover:border-primary/50'}`}
            >
              {signaturePreview ? (
                <>
                  <img src={signaturePreview} alt="Signature Preview" className="w-full h-full object-contain p-2" />
                  <button
                    onClick={removeSignature}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                    title="Hapus tanda tangan"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-on-surface-variant/60 pointer-events-none">
                  <Upload size={20} />
                  <span className="text-[10px] font-medium text-center px-2">Upload TTD (PNG)</span>
                </div>
              )}
              
              {!signaturePreview && (
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png, image/jpeg" 
                  onChange={onFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              )}
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant/70 mt-1">
            Gunakan gambar PNG transparan agar menyatu dengan background KTA. Maksimal 2MB.
          </p>
        </div>

        {/* Nama Tanda Tangan */}
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-sm font-semibold text-on-surface">Nama Penanda Tangan</label>
          <input 
            type="text" 
            value={formData.kta_signature_name}
            onChange={(e) => handleChange('kta_signature_name', e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/50"
            placeholder="Contoh: M. Hafiz Al-Fath"
          />
          <p className="text-[11px] text-on-surface-variant/70 mt-1">
            Nama lengkap yang akan ditampilkan di bawah tanda tangan (contoh: Ketua BEM).
          </p>
        </div>
      </div>
    </div>
  );
};
