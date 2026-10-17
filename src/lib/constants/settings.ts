/**
 * Key `SystemSetting` yang dipakai di seluruh aplikasi.
 * Wajib memakai konstanta ini untuk mencegah magic string.
 */
export const SETTING_KEYS = {
  // Pendaftaran
  REG_IS_ACTIVE: "reg_is_active",
  REG_REQ_KTM: "reg_req_ktm",
  REG_REQ_FOTO: "reg_req_foto",
  REG_DATE_FROM: "reg_date_from",
  REG_DATE_TO: "reg_date_to",
  REG_MAX_QUOTA: "reg_max_quota",

  // Organisasi
  ORG_NAME: "org_name",
  ORG_DESCRIPTION: "org_description",
  ORG_EMAIL: "org_email",
  ORG_ADDRESS: "org_address",
  ORG_WHATSAPP: "org_whatsapp",
  ORG_INSTAGRAM: "org_instagram",
  ORG_LOGO: "org_logo",
  ORG_FAVICON: "org_favicon",

  // Kartu Tanda Anggota (KTA)
  KTA_BG_FRONT_URL: "kta_bg_front_url",
  KTA_BG_BACK_URL: "kta_bg_back_url",
  KTA_ORG_NAME: "kta_org_name",
  KTA_MEMBER_PREFIX: "kta_member_prefix",
  KTA_VALIDITY_MONTHS: "kta_validity_months",
  KTA_SHOW_PHOTO: "kta_show_photo",
  KTA_SHOW_NAME: "kta_show_name",
  KTA_SHOW_NIM: "kta_show_nim",
  KTA_SHOW_MEMBER_ID: "kta_show_member_id",
  KTA_SHOW_FACULTY: "kta_show_faculty",
  KTA_SHOW_MAJOR: "kta_show_major",
  KTA_SHOW_VALIDITY: "kta_show_validity",
  KTA_SHOW_QR: "kta_show_qr",
  KTA_SIGNATURE_URL: "kta_signature_url",
  KTA_SIGNATURE_NAME: "kta_signature_name",
  KTA_TERMS: "kta_terms",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const SETTING_CATEGORIES = {
  GENERAL: "GENERAL",
  REGISTRATION: "REGISTRATION",
  ID_CARD: "ID_CARD",
} as const;

export interface SettingRow {
  key: string;
  value?: string | null;
}

export interface ParsedRegistrationSettings {
  isActive: boolean;
  reqKtm: boolean;
  reqFoto: boolean;
  dateFrom: Date | null;
  dateTo: Date | null;
  maxQuota: number;
}

function parseDateSafe(val?: string | null): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Mapper tunggal untuk mengubah baris raw SystemSetting menjadi objek konfigurasi pendaftaran typed.
 */
export function parseRegistrationSettings(
  rows?: SettingRow[] | null
): ParsedRegistrationSettings {
  const result: ParsedRegistrationSettings = {
    isActive: true,
    reqKtm: true,
    reqFoto: true,
    dateFrom: null,
    dateTo: null,
    maxQuota: 0,
  };

  if (!rows || !Array.isArray(rows)) return result;

  for (const item of rows) {
    if (!item?.key) continue;
    const val = item.value ?? "";
    switch (item.key) {
      case SETTING_KEYS.REG_IS_ACTIVE:
        result.isActive = val === "true";
        break;
      case SETTING_KEYS.REG_REQ_KTM:
        result.reqKtm = val === "true";
        break;
      case SETTING_KEYS.REG_REQ_FOTO:
        result.reqFoto = val === "true";
        break;
      case SETTING_KEYS.REG_DATE_FROM:
        result.dateFrom = parseDateSafe(val);
        break;
      case SETTING_KEYS.REG_DATE_TO:
        result.dateTo = parseDateSafe(val);
        break;
      case SETTING_KEYS.REG_MAX_QUOTA:
        result.maxQuota = val ? parseInt(val, 10) || 0 : 0;
        break;
    }
  }

  return result;
}

/**
 * Helper untuk mengubah daftar baris setting menjadi Map<key, value>.
 */
export function settingsToMap(rows?: SettingRow[] | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!rows || !Array.isArray(rows)) return map;
  for (const item of rows) {
    if (item?.key) {
      map.set(item.key, item.value ?? "");
    }
  }
  return map;
}
