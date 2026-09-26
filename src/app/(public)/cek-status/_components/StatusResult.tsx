import { useCekStatusStore } from "@/store/useCekStatusStore";
import { DownloadSection } from "./DownloadSection";

export const StatusResult = () => {
  const { statusData } = useCekStatusStore();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { 
          title: "Sedang Direview", 
          desc: "Data Anda sedang diperiksa oleh panitia. Mohon tunggu informasi selanjutnya.",
        };
      case 'APPROVED':
        return { 
          title: "Pendaftaran Diterima!", 
          desc: "Selamat! Pendaftaran Anda telah disetujui. Anda resmi menjadi anggota.",
        };
      case 'ACTIVE':
        return { 
          title: "Anggota Aktif", 
          desc: "Status keanggotaan Anda saat ini aktif. Anda dapat mengunduh ID Card.",
        };
      case 'REJECTED':
        return { 
          title: "Pendaftaran Ditolak", 
          desc: "Mohon maaf, pendaftaran Anda belum dapat kami terima saat ini.",
        };
      case 'SUSPENDED':
        return { 
          title: "Keanggotaan Ditangguhkan", 
          desc: "Keanggotaan Anda sedang ditangguhkan. Silakan hubungi admin untuk informasi lebih lanjut.",
        };
      default:
        return { 
          title: "Status Tidak Diketahui", 
          desc: "Status Anda tidak dapat dipastikan. Silakan hubungi administrator.",
        };
    }
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="bg-[#e0e3e5]/50 border border-[#bbcabf] rounded-xl p-4 flex gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-white border border-[#bbcabf] flex items-center justify-center shrink-0">
           <span className="material-symbols-outlined text-[#006c49]">person</span>
        </div>
        <div>
          <h3 className="font-bold text-[#191c1e] leading-tight">{statusData.name}</h3>
          <p className="text-sm text-[#3c4a42] mt-0.5">{statusData.nim} • {statusData.faculty}</p>
        </div>
      </div>

      <h4 className="font-semibold text-[#191c1e] mb-4 pb-2 border-b border-[#bbcabf]/30">Timeline Proses</h4>
      
      <div className="flex flex-col gap-6 ml-2">
        {/* Step 1 */}
        <div className="flex gap-4 relative">
          <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-[#006c49]"></div>
          <div className="w-6 h-6 rounded-full bg-[#006c49] flex items-center justify-center text-white shrink-0 z-10 ring-4 ring-white">
            <span className="material-symbols-outlined text-[14px]">check</span>
          </div>
          <div>
            <h5 className="font-semibold text-[#191c1e] text-[15px]">Pendaftaran Diterima</h5>
            <p className="text-[#3c4a42] text-[13px] mt-0.5">Data pendaftaran berhasil masuk ke sistem.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4 relative">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white ${statusData.status === 'APPROVED' || statusData.status === 'ACTIVE' ? 'bg-[#006c49] text-white' : statusData.status === 'REJECTED' || statusData.status === 'SUSPENDED' ? 'bg-red-500 text-white' : 'bg-[#e0e3e5] border-2 border-[#bbcabf] text-[#3c4a42]'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {statusData.status === 'APPROVED' || statusData.status === 'ACTIVE' ? 'check' : statusData.status === 'REJECTED' || statusData.status === 'SUSPENDED' ? 'close' : 'hourglass_empty'}
            </span>
          </div>
          <div>
            <h5 className={`font-semibold text-[15px] ${statusData.status === 'REJECTED' || statusData.status === 'SUSPENDED' ? 'text-red-600' : 'text-[#191c1e]'}`}>
              {getStatusInfo(statusData.status).title}
            </h5>
            <p className="text-[#3c4a42] text-[13px] mt-0.5">{getStatusInfo(statusData.status).desc}</p>
            
            {(statusData.status === "REJECTED" || statusData.status === "SUSPENDED") && statusData.adminNotes && (
              <div className="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                <strong className="block mb-1">Catatan Admin:</strong> 
                {statusData.adminNotes}
              </div>
            )}
          </div>
        </div>
      </div>

      <DownloadSection />
    </div>
  );
};
