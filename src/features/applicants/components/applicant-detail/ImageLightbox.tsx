import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto bg-transparent border-none shadow-none p-0 flex items-center justify-center">
        <DialogTitle className="sr-only">Pratinjau Dokumen Gambar</DialogTitle>
        <DialogDescription className="sr-only">
          Tampilan layar penuh gambar dokumen pendaftar
        </DialogDescription>
        <DialogClose
          aria-label="Tutup Pratinjau Dokumen"
          className="fixed top-5 right-5 z-[130] flex h-11 w-11 items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span className="material-symbols-outlined text-[24px] leading-none select-none flex items-center justify-center" aria-hidden>
            close
          </span>
        </DialogClose>
        {imageUrl && (
          <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center">
            <Image
              src={imageUrl}
              alt="Dokumen Preview"
              width={1200}
              height={800}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
              unoptimized
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
