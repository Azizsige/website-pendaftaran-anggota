import { useRef } from "react";
import { useCekStatusStore } from "@/store/useCekStatusStore";
import { updateMemberPhoto } from "@/app/actions/status-actions";
import { toPng } from 'html-to-image';

export const DownloadSection = () => {
  const { 
    statusData, 
    setStatusData, 
    nim, 
    email, 
    isUploadingPhoto, 
    setIsUploadingPhoto, 
    isDownloading, 
    setIsDownloading 
  } = useCekStatusStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    
    // Resize and crop to 3:4 aspect ratio using canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const targetRatio = 3 / 4;
        const imgRatio = img.width / img.height;
        
        let drawWidth = img.width;
        let drawHeight = img.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          drawWidth = img.height * targetRatio;
          offsetX = (img.width - drawWidth) / 2;
        } else {
          drawHeight = img.width / targetRatio;
          offsetY = (img.height - drawHeight) / 2;
        }

        canvas.width = 300;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, 300, 400);
          const base64Photo = canvas.toDataURL("image/jpeg", 0.9);
          
          try {
            const res = await updateMemberPhoto(nim, email, base64Photo);
            if (res.success) {
              setStatusData({ ...statusData, photoUrl: base64Photo });
            } else {
              alert(res.message);
            }
          } catch (err) {
            alert("Gagal mengunggah foto.");
          }
        }
        setIsUploadingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    const element = document.getElementById("id-card-element");
    if (!element) {
      alert("ID Card masih dalam proses pemuatan, silakan tunggu sebentar.");
      return;
    }
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(element, { 
        pixelRatio: 2,
        cacheBust: true,
        fontEmbedCSS: '', 
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `KTA-${statusData.nim}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to generate ID card", error);
      alert("Gagal mengunduh ID Card. Pastikan koneksi internet stabil.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (statusData.status !== "APPROVED" && statusData.status !== "ACTIVE") {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-[#bbcabf]/30">
      <h4 className="font-semibold text-[#191c1e] mb-3">Kartu Tanda Anggota Anda</h4>
      
      {(!statusData.photoUrl || statusData.photoUrl === "null" || statusData.photoUrl === "") ? (
        <div className="bg-amber-50 border border-amber-200 w-full p-5 rounded-xl flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
          </div>
          <div>
            <p className="text-[14px] text-amber-900 font-semibold">Foto Profil Belum Tersedia</p>
            <p className="text-[13px] text-amber-700 mt-1 max-w-[320px]">
              Anda <strong>wajib</strong> mengunggah foto profil terlebih dahulu sebelum dapat mengunduh ID Card. Foto akan disesuaikan otomatis ke rasio 3:4.
            </p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="mt-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors font-semibold py-2 px-5 rounded-lg flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
          >
            {isUploadingPhoto ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">upload</span>
            )}
            {isUploadingPhoto ? "Mengunggah..." : "Unggah Foto Profil"}
          </button>
        </div>
      ) : (
        <div className="bg-[#d0e1fb]/30 border border-[#b7c8e1] w-full p-5 rounded-xl flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#006c49] shadow-sm shrink-0 overflow-hidden border border-slate-200">
            <img src={statusData.photoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow">
            <p className="text-[14px] text-[#191c1e] font-semibold">ID Card Siap Diunduh</p>
            <p className="text-[13px] text-[#3c4a42]">Pastikan foto Anda sudah sesuai sebelum mengunduh.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto || isDownloading}
              className="bg-white border border-[#bbcabf] text-[#3c4a42] hover:bg-slate-50 transition-colors font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
              title="Ganti Foto"
            >
              {isUploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[16px]">edit</span>
              )}
              Ganti
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading || isUploadingPhoto}
              className="bg-white border border-[#006c49] text-[#006c49] hover:bg-[#006c49] hover:text-white transition-colors font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">download</span>
              )}
              {isDownloading ? "Memproses..." : "Unduh ID Card"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
