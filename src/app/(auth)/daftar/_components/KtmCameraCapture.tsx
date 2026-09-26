"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Camera, X, RefreshCcw } from "lucide-react";

interface KtmCameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
  isInline?: boolean;
}

export default function KtmCameraCapture({ onCapture, onCancel, isInline = false }: KtmCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Gagal mengakses kamera. Pastikan Anda telah memberikan izin kamera.");
    }
  };

  useEffect(() => {
    setMounted(true);
    startCamera();
    return () => {
      // Cleanup stream when unmounting
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Make sure to stop stream if component unmounts early or user cancels
  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onCancel();
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Create a canvas with the intrinsic dimensions of the video stream
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the full video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        // Stop stream before passing back
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        onCapture(blob);
      }
    }, "image/jpeg", 0.9);
  };

  if (error) {
    const errorContent = (
      <div 
        id="cropper-portal"
        className={`${isInline ? "absolute" : "fixed"} inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4`}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        data-vaul-no-drag
      >
        <p className="text-white mb-4 text-center">{error}</p>
        <button onClick={handleCancel} className="px-4 py-2 bg-white text-black rounded">Tutup</button>
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
        <button onClick={handleCancel} className="p-2 bg-gray-800 rounded-full">
          <X size={24} />
        </button>
        <p className="font-semibold text-sm">Posisikan KTM di dalam garis</p>
        <button onClick={startCamera} className="p-2 bg-gray-800 rounded-full">
          <RefreshCcw size={20} />
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
        {/* KTM Ratio is 8.56:5.398 ~ 1.58. For screens we use roughly 300x190 */}
        <div className="relative z-10 w-[90%] max-w-sm aspect-[1.58] border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-lg pointer-events-none flex flex-col justify-center items-center">
          <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
             <span className="text-white/50 text-xs text-center px-2">Area<br/>Foto</span>
          </div>
        </div>
      </div>

      {/* Capture Button */}
      <div className="bg-black pb-8 pt-4 flex justify-center z-10">
        <button
          onClick={handleCapture}
          className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center active:bg-gray-200 transition-colors"
        >
          <Camera size={28} className="text-black" />
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  const target = (isInline && document.getElementById("admin-member-drawer-content")) || document.body;
  return createPortal(content, target);
}
