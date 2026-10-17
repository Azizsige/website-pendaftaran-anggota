import {
  checkDuplicateRegistration,
  getRegistrationQuotaCount,
  submitRegistration,
} from "@/actions/register";
import { getSystemSettings } from "@/actions/setting-actions";
import { formatDate } from "@/lib/format";
import { preprocessImageForOCR } from "@/lib/image-processing";
import { parseRegistrationSettings } from "@/lib/constants/settings";
import { logger } from "@/lib/logger";
import type { FormData as RegistrationFormData } from "./types";

export interface RegistrationConfig {
  reqKtm: boolean;
  reqFoto: boolean;
  isRegistrationOpen: boolean;
  regDateFrom: Date | null;
  regDateTo: Date | null;
  maxQuota: number;
  currentQuotaCount: number;
  regStatus: "OPEN" | "CLOSED_TOGGLE" | "CLOSED_BEFORE" | "CLOSED_AFTER" | "CLOSED_QUOTA";
  closedTitle: string;
  closedMessage: string;
}

export async function fetchRegistrationConfig(): Promise<RegistrationConfig> {
  const [res, quotaRes] = await Promise.all([
    getSystemSettings(),
    getRegistrationQuotaCount(),
  ]);

  const parsed = parseRegistrationSettings(res.success && res.data ? res.data : null);
  const reqKtm = parsed.reqKtm;
  const reqFoto = parsed.reqFoto;
  const isRegistrationOpen = parsed.isActive;
  const regDateFrom = parsed.dateFrom;
  const regDateTo = parsed.dateTo;
  const maxQuota = parsed.maxQuota;

  let regStatus: RegistrationConfig["regStatus"] = "OPEN";
  let closedMessage = "";
  let closedTitle = "Pendaftaran Ditutup";
  const now = new Date();

  if (!isRegistrationOpen) {
    regStatus = "CLOSED_TOGGLE";
    closedMessage =
      "Mohon maaf, saat ini pendaftaran anggota baru sedang tidak aktif. Silakan kembali lagi nanti atau hubungi administrator untuk informasi lebih lanjut.";
  } else if (regDateFrom && now < regDateFrom) {
    regStatus = "CLOSED_BEFORE";
    closedMessage = `Pendaftaran belum dibuka. Pendaftaran baru akan dimulai pada ${formatDate(regDateFrom)}.`;
    closedTitle = "Belum Dibuka";
  } else if (regDateTo && now > regDateTo) {
    regStatus = "CLOSED_AFTER";
    closedMessage = `Mohon maaf, pendaftaran telah ditutup sejak ${formatDate(regDateTo)}.`;
    closedTitle = "Pendaftaran Berakhir";
  } else if (maxQuota > 0 && quotaRes.count >= maxQuota) {
    regStatus = "CLOSED_QUOTA";
    closedMessage = `Mohon maaf, kuota pendaftaran telah penuh (Maksimal ${maxQuota} pendaftar). Silakan pantau informasi selanjutnya untuk gelombang pendaftaran berikutnya.`;
    closedTitle = "Kuota Penuh";
  }

  return {
    reqKtm,
    reqFoto,
    isRegistrationOpen,
    regDateFrom,
    regDateTo,
    maxQuota,
    currentQuotaCount: quotaRes.count,
    regStatus,
    closedTitle,
    closedMessage,
  };
}

export async function checkApplicantDuplicate(nim: string, email: string) {
  return await checkDuplicateRegistration(nim, email);
}

export interface SubmitRegistrationResult {
  success: boolean;
  error?: string;
  reloadRequired?: boolean;
}

export async function submitApplicantRegistration(
  formData: RegistrationFormData
): Promise<SubmitRegistrationResult> {
  const form = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && typeof value !== "boolean") {
      if (!(value instanceof File)) form.append(key, String(value));
    }
  });

  if (formData.pasFoto instanceof File) {
    try {
      const base64 = await preprocessImageForOCR(formData.pasFoto);
      form.append("pasFotoBase64", base64);
    } catch (e) {
      logger.error("Failed to preprocess pasFoto", e);
    }
  }

  if (formData.fotoKTM instanceof File) {
    try {
      const base64 = await preprocessImageForOCR(formData.fotoKTM);
      form.append("fotoKTMBase64", base64);
    } catch (e) {
      logger.error("Failed to preprocess fotoKTM", e);
    }
  }

  const res = await submitRegistration(form);
  if (!res.success) {
    const isQuotaFull = res.error?.toLowerCase().includes("kuota");
    return {
      success: false,
      error: res.error || "Gagal melakukan pendaftaran.",
      reloadRequired: isQuotaFull,
    };
  }

  return { success: true };
}
