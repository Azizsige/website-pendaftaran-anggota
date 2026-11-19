import { describe, it, expect, vi, beforeEach } from "vitest";
import { useIdCardSettingStore } from "@/features/settings/stores/useIdCardSettingStore";

vi.mock("@/actions/setting-actions", () => ({
  getSystemSettings: vi.fn(),
  updateMultipleSettings: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { getSystemSettings, updateMultipleSettings } from "@/actions/setting-actions";

describe("useIdCardSettingStore (Real-Time Preview & Settings)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useIdCardSettingStore.setState({
      isLoading: true,
      isSaving: false,
      frontBgPreview: null,
      backBgPreview: null,
      signaturePreview: null,
    });
  });

  it("memperbarui formData secara sinkron saat mengubah identitas & toggle komponen", () => {
    const { handleChange, handleCheckboxChange } = useIdCardSettingStore.getState();

    handleChange("kta_org_name", "Himpunan Mahasiswa Informatika");
    handleChange("kta_org_subtitle", "Universitas Nusantara");
    handleChange("kta_period_label", "2026/2027");
    handleChange("kta_signature_title", "Ketua Himpunan");
    handleCheckboxChange("kta_show_faculty", false);
    handleCheckboxChange("kta_show_qr", false);

    const state = useIdCardSettingStore.getState();
    expect(state.formData.kta_org_name).toBe("Himpunan Mahasiswa Informatika");
    expect(state.formData.kta_org_subtitle).toBe("Universitas Nusantara");
    expect(state.formData.kta_period_label).toBe("2026/2027");
    expect(state.formData.kta_signature_title).toBe("Ketua Himpunan");
    expect(state.formData.kta_show_faculty).toBe("false");
    expect(state.formData.kta_show_qr).toBe("false");
  });

  it("memuat setting KTA dari server termasuk field periode dan subjudul", async () => {
    vi.mocked(getSystemSettings).mockResolvedValue({
      success: true,
      data: [
        {
          id: "1",
          category: "ID_CARD",
          key: "kta_org_subtitle",
          value: "Universitas Sriwijaya",
          description: null,
          updatedAt: new Date(),
        },
        {
          id: "2",
          category: "ID_CARD",
          key: "kta_period_label",
          value: "2027/2028",
          description: null,
          updatedAt: new Date(),
        },
        {
          id: "3",
          category: "ID_CARD",
          key: "kta_show_major",
          value: "false",
          description: null,
          updatedAt: new Date(),
        },
      ],
    });

    await useIdCardSettingStore.getState().loadSettings();

    const state = useIdCardSettingStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.formData.kta_org_subtitle).toBe("Universitas Sriwijaya");
    expect(state.formData.kta_period_label).toBe("2027/2028");
    expect(state.formData.kta_show_major).toBe("false");
  });

  it("mengirim seluruh konfigurasi KTA termasuk field baru saat menyimpan", async () => {
    vi.mocked(updateMultipleSettings).mockResolvedValue({
      success: true,
      message: "OK",
    });

    const { handleChange, handleSave } = useIdCardSettingStore.getState();
    handleChange("kta_period_label", "2026/2027");
    handleChange("kta_signature_title", "Sekretaris Umum");

    await handleSave();

    const payload = vi.mocked(updateMultipleSettings).mock.calls[0][0];
    expect(payload).toContainEqual({ key: "kta_period_label", value: "2026/2027" });
    expect(payload).toContainEqual({
      key: "kta_signature_title",
      value: "Sekretaris Umum",
    });
  });
});
