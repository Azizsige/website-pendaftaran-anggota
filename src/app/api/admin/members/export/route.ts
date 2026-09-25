import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const ids = searchParams.get("ids");

    const whereClause: any = {
      status: {
        not: "PENDING"
      }
    };

    if (ids) {
      // If specific IDs are selected, ONLY filter by those IDs
      const idArray = ids.split(",");
      whereClause.id = { in: idArray };
    } else {
      // Otherwise apply normal filters
      if (status !== "all") {
        let dbStatus = status.toUpperCase();
        if (dbStatus === "ACTIVE") dbStatus = "ACTIVE";
        whereClause.status = dbStatus;
      }

      if (search) {
        whereClause.OR = [
          { id: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { phoneNumber: { contains: search, mode: "insensitive" } },
          { nim: { contains: search, mode: "insensitive" } },
        ];
      }
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
    const worksheet = workbook.addWorksheet("Data Anggota");

    // Add metadata rows
    worksheet.addRow(["DATA ANGGOTA BEM / UKM"]);

    let statusLabel = "Semua Status";
    if (status === "ACTIVE") statusLabel = "Aktif";
    else if (status === "INACTIVE") statusLabel = "Tidak Aktif";
    else if (status === "SUSPENDED") statusLabel = "Dibekukan";

    worksheet.addRow(["Status", ":", statusLabel]);

    if (search) {
      worksheet.addRow(["Keyword", ":", search]);
    }

    worksheet.addRow([]); // Empty space

    // Style the title
    const titleCell = worksheet.getCell("A1");
    titleCell.font = { bold: true, size: 14 };
    worksheet.mergeCells("A1:H1");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.getRow(1).height = 30;

    // Add header row for table
    const headerRow = worksheet.addRow([
      "Tanggal Bergabung", "NIM", "Nama Lengkap", "Fakultas", "Jurusan", "Kontak", "Email", "Status"
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
        fgColor: { argb: "FF006C49" }, // Primary green background
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
      });

      let formattedStatus = member.status;
      if (member.status === "ACTIVE") formattedStatus = "Aktif";
      else if (member.status === "INACTIVE") formattedStatus = "Tidak Aktif";
      else if (member.status === "SUSPENDED") formattedStatus = "Dibekukan";

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
        "Content-Disposition": 'attachment; filename="data-members.xlsx"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
