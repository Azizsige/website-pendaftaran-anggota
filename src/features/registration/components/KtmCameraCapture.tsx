"use client";

import React, { useRef, useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Camera, X, RefreshCcw } from "lucide-react";
import { logger } from "@/lib/logger";

interface KtmCameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
  isInline?: boolean;
}

const emptySubscribe = () => () => {};

function getCameraErrorDetails(err: unknown): {
  userMessage: string;
  shouldWarn: boolean;
  errorName: string;
  errorMessage: string;
} {
  const errorName =
    err instanceof DOMException || err instanceof Error ? err.name : "UnknownError";
  const errorMessage = err instanceof Error ? err.message : String(err ?? "");

  if (
    errorName === "NotAllowedError" ||
    errorName === "PermissionDeniedError" ||
    errorName === "AbortError"
  ) {
    return {
      userMessage:
        "Akses kamera dibatalkan atau belum diizinkan. Izinkan akses kamera di browser Anda lalu coba lagi.",
      shouldWarn: false,
      errorName,
      errorMessage,
    };
  }

  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return {
      userMessage: "Perangkat kamera tidak ditemukan pada perangkat ini.",
      shouldWarn: false,
      errorName,
      errorMessage,
    };
  }

  if (errorName === "NotReadableError" || errorName === "TrackStartError") {
    return {
      userMessage:
        "Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.",
      shouldWarn: false,
      errorName,
      errorMessage,
    };
  }

  return {
    userMessage:
      "Gagal mengakses kamera. Pastikan Anda telah memberikan izin kamera.",
    shouldWarn: true,
    errorName,
    errorMessage,
  };
}

export default function KtmCameraCapture({ onCapture, onCancel, isInline = false }: KtmCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isUnmountedRef = useRef(false);
  const [error, setError] = useState<string>("");
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const stopActiveStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopActiveStream();
    setError("");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setError("Browser ini tidak mendukung akses kamera langsung. Silakan unggah file gambar.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      // Avoid leaking camera indicator if user closed or StrictMode unmounted before permission resolved.
      if (isUnmountedRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      if (isUnmountedRef.current) return;
      const details = getCameraErrorDetails(err);
      if (details.shouldWarn) {
        logger.warn("Camera access failed", {
          errorName: details.errorName,
          errorMessage: details.errorMessage,
        });
      }
      setError(details.userMessage);
    }
  }, [stopActiveStream]);

  useEffect(() => {
    isUnmountedRef.current = false;
    const initTimer = window.setTimeout(() => {
      void startCamera();
    }, 0);

    return () => {
      window.clearTimeout(initTimer);
      isUnmountedRef.current = true;
      stopActiveStream();
    };
  }, [startCamera, stopActiveStream]);

  const handleCancel = () => {
    stopActiveStream();
    onCancel();
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        stopActiveStream();
        onCapture(blob);
      }
    }, "image/jpeg", 0.9);
  };

  if (error) {
    const errorContent = (
      <div 
        id="cropper-portal"
        role="dialog"
        aria-modal="true"
        aria-label="Akses kamera"
        className={`${isInline ? "absolute" : "fixed"} inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6`}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        data-vaul-no-drag
      >
        <p className="text-white mb-6 text-center max-w-sm text-sm sm:text-base leading-relaxed">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void startCamera()}
            className="min-h-[44px] cursor-pointer px-5 py-2.5 bg-[#057a55] hover:bg-[#046c4e] text-white font-medium rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="min-h-[44px] cursor-pointer px-5 py-2.5 bg-white hover:bg-gray-100 text-[#191c1e] font-medium rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
    if (!mounted) return null;
    const target = (isInline && document.getElementById("admin-member-drawer-content")) || document.body;
    return createPortal(errorContent, target);
  }

  const content = (
    <div 
      id="cropper-portal"
      className={`${isInline ? "absolute" : "fixed"} inset-0 z-[100] bg-black flex flex-col`}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      data-vaul-no-drag
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white bg-black/50 absolute top-0 left-0 right-0 z-10">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Tutup kamera"
          className="min-h-[44px] min-w-[44px] cursor-pointer flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={24} aria-hidden="true" />
        </button>
        <p className="font-semibold text-sm">Posisikan KTM di dalam garis</p>
        <button
          type="button"
          onClick={() => void startCamera()}
          aria-label="Muat ulang kamera"
          className="min-h-[44px] min-w-[44px] cursor-pointer flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
        >
          <RefreshCcw size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Video Feed & Guide */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay Darkener */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Clear Window / KTM Frame */}
        <div className="relative z-10 w-[90%] max-w-sm aspect-[1.58] border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-lg pointer-events-none flex flex-col justify-center items-center">
          <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
             <span className="text-white/50 text-xs text-center px-2">Area<br/>Foto</span>
          </div>
        </div>
      </div>

      {/* Capture Button */}
      <div className="bg-black pb-8 pt-4 flex justify-center z-10">
        <button
          type="button"
          onClick={handleCapture}
          aria-label="Ambil foto KTM"
          className="w-16 h-16 cursor-pointer bg-white rounded-full border-4 border-gray-300 flex items-center justify-center active:bg-gray-200 transition-colors"
        >
          <Camera size={28} className="text-black" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  const target = (isInline && document.getElementById("admin-member-drawer-content")) || document.body;
  return createPortal(content, target);
}
