import { startOfDay, endOfDay } from "date-fns";
import { getReportMembers } from "@/actions/admin-reports";
import { DateRange } from "react-day-picker";

interface UseReportExportProps {
  date: DateRange | undefined;
  status: string;
  faculty: string;
}

export function useReportExport({ date, status, faculty }: UseReportExportProps) {
  const handleExport = () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (faculty !== 'all_faculty') params.set('faculty', faculty);
    if (date?.from) params.set('from', date.from.toISOString());
    if (date?.to) params.set('to', date.to.toISOString());
    
    window.location.href = `/api/admin/reports/export?${params.toString()}`;
  };

  const handlePrint = async () => {
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      let dateFrom = date?.from ? startOfDay(date.from) : undefined;
      let dateTo = date?.to ? endOfDay(date.to) : dateFrom ? endOfDay(dateFrom) : undefined;
      const res = await getReportMembers(status, faculty, dateFrom, dateTo, 1, 10000);
      const allMembers = res.data;

      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Placeholder Logos
      doc.setFillColor(0, 108, 73);
      doc.rect(14, 15, 20, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("LOGO BEM", 24, 26, { align: "center" });

      doc.setFillColor(20, 30, 45);
      doc.rect(pageWidth - 34, 15, 20, 20, 'F');
      doc.text("KAMPUS", pageWidth - 24, 26, { align: "center" });
      
      // Header Text
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN DATA ANGGOTA", pageWidth / 2, 22, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Badan Eksekutif Mahasiswa (BEM) / Unit Kegiatan Mahasiswa", pageWidth / 2, 28, { align: "center" });
      
      const fromStr = date?.from ? new Date(date.from).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Semua Waktu";
      const toStr = date?.to ? new Date(date.to).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Semua Waktu";
      
      doc.text(`Dari Tanggal    : ${fromStr}`, 14, 45);
      doc.text(`Sampai Tanggal  : ${toStr}`, 14, 50);
      
      let statusLabel = "Semua Status";
      if (status === "ACTIVE") statusLabel = "Aktif / Disetujui";
      else if (status === "PENDING") statusLabel = "Menunggu";
      else if (status === "REJECTED") statusLabel = "Ditolak";
      doc.text(`Status          : ${statusLabel}`, 14, 55);

      let facultyLabel = "Semua Fakultas";
      if (faculty === "teknik") facultyLabel = "Fakultas Teknik";
      else if (faculty === "ekonomi") facultyLabel = "Fakultas Ekonomi";
      else if (faculty === "hukum") facultyLabel = "Fakultas Hukum";
      doc.text(`Fakultas        : ${facultyLabel}`, 14, 60);

      // Table Data
      const tableColumn = ["Tanggal Mendaftar", "NIM", "Nama Lengkap", "Fakultas", "Jurusan", "Kontak", "Email", "Status"];
      const tableRows: any[] = [];

      allMembers.forEach((member: any) => {
        let phone = member.phoneNumber || "";
        if (phone.startsWith("8")) phone = "0" + phone;
        else if (phone.startsWith("62")) phone = "0" + phone.slice(2);
        else if (phone.startsWith("+62")) phone = "0" + phone.slice(3);

        const formattedDate = new Date(member.joinDate).toLocaleString("id-ID", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        }) + " WIB";

        const formattedStatus = member.status === 'ACTIVE' || member.status === 'APPROVED' ? 'Aktif' :
                                member.status === 'INACTIVE' ? 'Tidak Aktif' :
                                member.status === 'PENDING' ? 'Menunggu' :
                                member.status === 'SUSPENDED' ? 'Dibekukan' : 'Ditolak';

        tableRows.push([
          formattedDate, member.nim || "-", member.user?.name || "-", member.faculty || "-",
          member.major || "-", phone || "-", member.user?.email || "-", formattedStatus
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [0, 108, 73], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [247, 249, 251] }
      });

      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      
    } catch (error) {
      console.error("Failed to generate print PDF:", error);
      alert("Gagal memuat dokumen untuk di-print.");
    }
  };

  return { handleExport, handlePrint };
}
