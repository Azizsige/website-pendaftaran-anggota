import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const faculty = searchParams.get("faculty") || "all_faculty";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const whereClause: any = {};

    if (status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (faculty !== "all_faculty") {
      if (faculty === "teknik") whereClause.faculty = { contains: "teknik", mode: "insensitive" };
      else if (faculty === "ekonomi") whereClause.faculty = { contains: "ekonomi", mode: "insensitive" };
      else if (faculty === "hukum") whereClause.faculty = { contains: "hukum", mode: "insensitive" };
      else whereClause.faculty = faculty;
    }

    if (from && to) {
      whereClause.joinDate = {
        gte: new Date(from),
        lte: new Date(to),
      };
    } else if (from) {
      whereClause.joinDate = {
        gte: new Date(from),
      };
    } else if (to) {
      whereClause.joinDate = {
        lte: new Date(to),
      };
    }

    const members = await prisma.memberProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Data Anggota");

    // Add metadata rows
    worksheet.addRow(["LAPORAN DATA ANGGOTA"]);
    worksheet.addRow(["Dari Tanggal", ":", from ? new Date(from).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "Semua Waktu"]);
    worksheet.addRow(["Sampai Tanggal", ":", to ? new Date(to).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "Semua Waktu"]);
    
    let statusLabel = "Semua Status";
    if (status === "ACTIVE") statusLabel = "Aktif / Disetujui";
    else if (status === "PENDING") statusLabel = "Menunggu";
    else if (status === "REJECTED") statusLabel = "Ditolak";
    worksheet.addRow(["Status", ":", statusLabel]);
    
    let facultyLabel = "Semua Fakultas";
    if (faculty === "teknik") facultyLabel = "Fakultas Teknik";
    else if (faculty === "ekonomi") facultyLabel = "Fakultas Ekonomi";
    else if (faculty === "hukum") facultyLabel = "Fakultas Hukum";
    worksheet.addRow(["Fakultas", ":", facultyLabel]);

    worksheet.addRow([]); // Empty space

    // Style the title
    const titleCell = worksheet.getCell("A1");
    titleCell.font = { bold: true, size: 14 };
    worksheet.mergeCells("A1:H1");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    
    worksheet.getRow(1).height = 30;

    // Add header row for table
    const headerRow = worksheet.addRow([
      "Tanggal Mendaftar", "NIM", "Nama Lengkap", "Fakultas", "Jurusan", "Kontak", "Email", "Status"
    ]);

    // Set column widths manually
    worksheet.getColumn(1).width = 25; // Tanggal
    worksheet.getColumn(2).width = 20; // NIM
    worksheet.getColumn(3).width = 30; // Nama
    worksheet.getColumn(4).width = 25; // Fakultas
    worksheet.getColumn(5).width = 25; // Jurusan
    worksheet.getColumn(6).width = 20; // Kontak
    worksheet.getColumn(7).width = 30; // Email
    worksheet.getColumn(8).width = 15; // Status

    // Style the header row
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF006c49" }, // Custom primary color
      };
      cell.font = {
        color: { argb: "FFFFFFFF" }, // White text
        bold: true,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Add data
    for (const member of members) {
      // Handle phone number formatting
      let phone = member.phoneNumber || "";
      if (phone.startsWith("8")) {
        phone = "0" + phone;
      } else if (phone.startsWith("62")) {
        phone = "0" + phone.slice(2);
      } else if (phone.startsWith("+62")) {
        phone = "0" + phone.slice(3);
      }

      // Format date
      const formattedDate = new Date(member.joinDate).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

      const formattedStatus = member.status === 'ACTIVE' || member.status === 'APPROVED' ? 'Aktif' :
                              member.status === 'INACTIVE' ? 'Tidak Aktif' :
                              member.status === 'PENDING' ? 'Menunggu' :
                              member.status === 'SUSPENDED' ? 'Dibekukan' : 'Ditolak';

      const row = worksheet.addRow([
        formattedDate,
        member.nim || "-",
        member.user?.name || "-",
        member.faculty || "-",
        member.major || "-",
        phone || "-",
        member.user?.email || "-",
        formattedStatus,
      ]);

      row.getCell(2).numFmt = "@"; // NIM
      row.getCell(6).numFmt = "@"; // Kontak
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan-anggota.xlsx"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
