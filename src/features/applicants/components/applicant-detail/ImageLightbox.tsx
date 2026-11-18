import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

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
      <DialogContent className="flex h-auto max-h-[95vh] w-auto max-w-[95vw] items-center justify-center border-none bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">Pratinjau Dokumen Gambar</DialogTitle>
        <DialogDescription className="sr-only">
          Tampilan layar penuh gambar dokumen pendaftar
        </DialogDescription>
        <DialogClose
          aria-label="Tutup Pratinjau Dokumen"
          className="fixed right-5 top-5 z-[130] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <X className="h-5 w-5" aria-hidden />
        </DialogClose>
        {imageUrl && (
          <div className="relative flex max-h-[85vh] max-w-[90vw] items-center justify-center">
            <Image
              src={imageUrl}
              alt="Pratinjau Dokumen"
              width={1200}
              height={800}
              className="h-auto max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              unoptimized
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
