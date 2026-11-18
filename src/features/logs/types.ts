export const ACTIVITY_LOGS_PAGE_SIZE = 5;

export const ACTIVITY_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOGIN_FAILED: "LOGIN_FAILED",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  VIEW_PAGE: "VIEW_PAGE",
  VIEW_APPLICANT_DETAIL: "VIEW_APPLICANT_DETAIL",
  EXPORT_APPLICANTS: "EXPORT_APPLICANTS",
  EXPORT_MEMBERS: "EXPORT_MEMBERS",
  EXPORT_REPORTS: "EXPORT_REPORTS",
  APPROVE_APPLICANT: "APPROVE_APPLICANT",
  REJECT_APPLICANT: "REJECT_APPLICANT",
  SUSPEND_APPLICANT: "SUSPEND_APPLICANT",
  UPDATE_APPLICANT_STATUS: "UPDATE_APPLICANT_STATUS",
  UPDATE_APPLICANT_NOTES: "UPDATE_APPLICANT_NOTES",
  DELETE_APPLICANT: "DELETE_APPLICANT",
  CREATE_MEMBER: "CREATE_MEMBER",
  UPDATE_MEMBER: "UPDATE_MEMBER",
  UPDATE_MEMBER_STATUS: "UPDATE_MEMBER_STATUS",
  DELETE_MEMBER: "DELETE_MEMBER",
  CREATE_ADMIN: "CREATE_ADMIN",
  UPDATE_ADMIN: "UPDATE_ADMIN",
  DELETE_ADMIN: "DELETE_ADMIN",
  UPDATE_SETTING: "UPDATE_SETTING",
  UPDATE_MULTIPLE_SETTINGS: "UPDATE_MULTIPLE_SETTINGS",
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  [ACTIVITY_ACTIONS.LOGIN]: "Masuk Sistem (Login)",
  [ACTIVITY_ACTIONS.LOGOUT]: "Keluar Sistem (Logout)",
  [ACTIVITY_ACTIONS.LOGIN_FAILED]: "Gagal Masuk (Login Ditolak)",
  [ACTIVITY_ACTIONS.UNAUTHORIZED_ACCESS]: "Percobaan Akses Tanpa Izin",
  [ACTIVITY_ACTIONS.VIEW_PAGE]: "Membuka Halaman Admin",
  [ACTIVITY_ACTIONS.VIEW_APPLICANT_DETAIL]: "Melihat Berkas Calon Anggota",
  [ACTIVITY_ACTIONS.EXPORT_APPLICANTS]: "Mengekspor Data Calon Anggota",
  [ACTIVITY_ACTIONS.EXPORT_MEMBERS]: "Mengekspor Data Anggota",
  [ACTIVITY_ACTIONS.EXPORT_REPORTS]: "Mengekspor Laporan Keanggotaan",
  [ACTIVITY_ACTIONS.APPROVE_APPLICANT]: "Menyetujui Calon Anggota",
  [ACTIVITY_ACTIONS.REJECT_APPLICANT]: "Menolak Calon Anggota",
  [ACTIVITY_ACTIONS.SUSPEND_APPLICANT]: "Membekukan Calon Anggota",
  [ACTIVITY_ACTIONS.UPDATE_APPLICANT_STATUS]: "Mengubah Status Calon Anggota",
  [ACTIVITY_ACTIONS.UPDATE_APPLICANT_NOTES]: "Memperbarui Catatan Verifikasi",
  [ACTIVITY_ACTIONS.DELETE_APPLICANT]: "Menghapus Calon Anggota",
  [ACTIVITY_ACTIONS.CREATE_MEMBER]: "Menambah Anggota Aktif",
  [ACTIVITY_ACTIONS.UPDATE_MEMBER]: "Memperbarui Profil Anggota",
  [ACTIVITY_ACTIONS.UPDATE_MEMBER_STATUS]: "Mengubah Status Anggota",
  [ACTIVITY_ACTIONS.DELETE_MEMBER]: "Menghapus Data Anggota",
  [ACTIVITY_ACTIONS.CREATE_ADMIN]: "Menambah Akun Admin",
  [ACTIVITY_ACTIONS.UPDATE_ADMIN]: "Memperbarui Akun Admin",
  [ACTIVITY_ACTIONS.DELETE_ADMIN]: "Menghapus Akun Admin",
  [ACTIVITY_ACTIONS.UPDATE_SETTING]: "Memperbarui Pengaturan",
  [ACTIVITY_ACTIONS.UPDATE_MULTIPLE_SETTINGS]: "Memperbarui Konfigurasi Sistem",
};

export const ACTIVITY_ENTITY_LABELS: Record<string, string> = {
  Auth: "Autentikasi & Sesi",
  Security: "Keamanan & Hak Akses",
  Navigation: "Navigasi Panel",
  Export: "Ekspor Dokumen",
  MemberProfile: "Pendaftar & Anggota",
  User: "Akun Pengelola",
  SystemSetting: "Pengaturan Sistem",
};

export type ActivityCategory =
  | "all"
  | "SECURITY"
  | "AUTH"
  | "NAVIGATION"
  | "APPLICANT"
  | "MEMBER"
  | "ADMIN"
  | "SETTINGS";

export const ACTIVITY_CATEGORY_ACTIONS: Record<Exclude<ActivityCategory, "all">, readonly string[]> = {
  SECURITY: [ACTIVITY_ACTIONS.UNAUTHORIZED_ACCESS, ACTIVITY_ACTIONS.LOGIN_FAILED],
  AUTH: [ACTIVITY_ACTIONS.LOGIN, ACTIVITY_ACTIONS.LOGOUT],
  NAVIGATION: [
    ACTIVITY_ACTIONS.VIEW_PAGE,
    ACTIVITY_ACTIONS.VIEW_APPLICANT_DETAIL,
    ACTIVITY_ACTIONS.EXPORT_APPLICANTS,
    ACTIVITY_ACTIONS.EXPORT_MEMBERS,
    ACTIVITY_ACTIONS.EXPORT_REPORTS,
  ],
  APPLICANT: [
    ACTIVITY_ACTIONS.APPROVE_APPLICANT,
    ACTIVITY_ACTIONS.REJECT_APPLICANT,
    ACTIVITY_ACTIONS.SUSPEND_APPLICANT,
    ACTIVITY_ACTIONS.UPDATE_APPLICANT_STATUS,
    ACTIVITY_ACTIONS.UPDATE_APPLICANT_NOTES,
    ACTIVITY_ACTIONS.DELETE_APPLICANT,
  ],
  MEMBER: [
    ACTIVITY_ACTIONS.CREATE_MEMBER,
    ACTIVITY_ACTIONS.UPDATE_MEMBER,
    ACTIVITY_ACTIONS.UPDATE_MEMBER_STATUS,
    ACTIVITY_ACTIONS.DELETE_MEMBER,
  ],
  ADMIN: [
    ACTIVITY_ACTIONS.CREATE_ADMIN,
    ACTIVITY_ACTIONS.UPDATE_ADMIN,
    ACTIVITY_ACTIONS.DELETE_ADMIN,
  ],
  SETTINGS: [
    ACTIVITY_ACTIONS.UPDATE_SETTING,
    ACTIVITY_ACTIONS.UPDATE_MULTIPLE_SETTINGS,
  ],
};

export interface ActivityLogActor {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: ActivityLogActor;
}

export interface SystemDiagnostics {
  dbConnected: boolean;
  dbLatencyMs: number;
  checkedAt: string;
  registrationActive: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  counts: {
    totalLogsNonOwner: number;
    logsLast24h: number;
    activeAdminsNonOwner: number;
    totalMembers: number;
    pendingApplicants: number;
    securityAlertsCount: number;
  };
  tableCounts: {
    users: number;
    memberProfiles: number;
    activityLogs: number;
    systemSettings: number;
  };
  storage: {
    photosStored: number;
    ktmStored: number;
    documentsStored: number;
    cloudFilesCount: number;
    base64FilesCount: number;
  };
  integrity: {
    orphanMemberUsers: number;
    statusMismatches: number;
    incompleteDocuments: number;
  };
  ownerSecurity: {
    currentIp: string;
    ipRestrictionEnabled: boolean;
    deviceLockEnabled: boolean;
  };
}

export interface ActivityLogsResponse {
  data: ActivityLogItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  diagnostics: SystemDiagnostics;
}
