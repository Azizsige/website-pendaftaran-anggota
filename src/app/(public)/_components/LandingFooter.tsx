import React from "react";
import Image from "next/image";

interface LandingFooterProps {
  orgName: string;
  orgLogo?: string;
  orgAddress?: string;
  orgWhatsapp?: string;
  orgInstagram?: string;
}

export function LandingFooter({
  orgName,
  orgLogo,
  orgAddress,
  orgWhatsapp,
  orgInstagram,
}: LandingFooterProps) {
  return (
    <footer className="bg-[#191c1e] text-[#f7f9fb] py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {orgLogo && (
              <div className="relative w-8 h-8 rounded bg-white p-0.5">
                <Image
                  src={orgLogo}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <h3 className="text-xl font-bold">{orgName}</h3>
          </div>
          {orgAddress && (
            <p className="text-[#bbcabf] text-sm leading-relaxed flex gap-2">
              <span className="material-symbols-outlined text-sm shrink-0">
                location_on
              </span>
              {orgAddress}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-white">Hubungi Kami</h4>
          {orgWhatsapp && (
            <a
              href={`https://wa.me/62${orgWhatsapp.replace(/^0+/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#bbcabf] hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              +62 {orgWhatsapp}
            </a>
          )}
          {orgInstagram && (
            <a
              href={`https://instagram.com/${orgInstagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#bbcabf] hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                photo_camera
              </span>
              @{orgInstagram}
            </a>
          )}
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <p className="text-[#bbcabf] text-sm">
            &copy; {new Date().getFullYear()} {orgName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
