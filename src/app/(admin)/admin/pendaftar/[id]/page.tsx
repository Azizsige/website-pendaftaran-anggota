"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileImage,
} from "lucide-react";

export default function DetailPendaftarPage() {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [status, setStatus] = useState<"Pending" | "Approved" | "Rejected">("Pending");

  const data = {
    nama: "Siti Aisyah",
    nik: "3275021234567891",
    email: "siti.aisyah@ymail.com",
    telepon: "081298765432",
    tempatLahir: "Bandung",
    tanggalLahir: "12 Mei 1998",
    jenisKelamin: "Perempuan",
    alamat: "Jl. Dago No. 10, RT 02/RW 05, Kel. Dago, Kec. Coblong",
    provinsi: "Jawa Barat",
    kota: "Bandung",
    tanggalDaftar: "27 Agustus 2026",
  };

  const handleApprove = () => setStatus("Approved");
  const handleReject = () => {
    setStatus("Rejected");
    setShowRejectModal(false);
  };

  const statusBadge = () => {
    switch (status) {
      case "Approved":
        return "badge badge-success";
      case "Rejected":
        return "badge badge-danger";
      default:
        return "badge badge-warning";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Back */}
      <Link
        href="/admin/pendaftar"
        className="inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Daftar Pendaftar
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Detail Pendaftar</h1>
          <p className="text-slate-600 mt-1">
            Review data dan dokumen pendaftar.
          </p>
        </div>
        <span className={statusBadge()}>{status}</span>
      </div>

      {/* Data Diri */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <User size={18} className="text-[#006c49]" />
          Data Diri
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: User, label: "Nama Lengkap", value: data.nama },
            { icon: CreditCard, label: "NIK", value: data.nik },
            { icon: Mail, label: "Email", value: data.email },
            { icon: Phone, label: "No. Telepon", value: data.telepon },
            {
              icon: Calendar,
              label: "Tempat, Tanggal Lahir",
              value: `${data.tempatLahir}, ${data.tanggalLahir}`,
            },
            { icon: User, label: "Jenis Kelamin", value: data.jenisKelamin },
            { icon: MapPin, label: "Alamat", value: data.alamat },
            {
              icon: MapPin,
              label: "Provinsi / Kota",
              value: `${data.provinsi}, ${data.kota}`,
            },
            {
              icon: Calendar,
              label: "Tanggal Daftar",
              value: data.tanggalDaftar,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <Icon
                  size={16}
                  className="text-slate-500 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.label}
                  </p>
                  <p className="text-sm text-slate-900 font-medium">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dokumen */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <FileImage size={18} className="text-[#006c49]" />
          Dokumen
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {["Pas Foto (3x4)", "Foto KTP"].map((doc) => (
            <div
              key={doc}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs"
            >
              <div className="h-48 bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <FileImage
                    size={32}
                    className="text-slate-400 mx-auto mb-2"
                  />
                  <p className="text-xs text-slate-500">
                    Preview Dokumen
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white border-t border-slate-100">
                <p className="text-sm font-medium text-slate-900">{doc}</p>
                <p className="text-xs text-slate-500">
                  JPG · 456 KB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {status === "Pending" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={() => setShowRejectModal(true)}
            className="btn-danger inline-flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            Tolak Pendaftaran
          </button>
          <button
            onClick={handleApprove}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            Terima Pendaftaran
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="relative bg-white p-6 sm:p-8 rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Tolak Pendaftaran
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Berikan alasan penolakan untuk dikirimkan ke pendaftar.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tuliskan alasan penolakan..."
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-5"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="btn-danger inline-flex items-center gap-2"
              >
                <XCircle size={16} />
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
