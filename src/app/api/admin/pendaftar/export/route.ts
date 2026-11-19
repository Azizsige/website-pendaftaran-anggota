import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/auth/guards";
import { ACTIVITY_ACTIONS, recordActivityLog } from "@/lib/activity-log";
import { Prisma } from "@prisma/client";
import { normalizeIndonesianPhone } from "@/lib/format";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const whereClause: Prisma.MemberProfileWhereInput = {};

    if (status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const applicants = await prisma.memberProfile.findMany({
      where: whereClause,
      select: {
        id: true,
        phoneNumber: true,
        joinDate: true,
        status: true,
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { joinDate: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Pendaftar");

    // Define columns
    worksheet.columns = [
      { header: "ID Pendaftaran", key: "id", width: 20 },
      { header: "Nama Lengkap", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Nomor Telepon", key: "phone", width: 20 },
      { header: "Tanggal Daftar", key: "date", width: 25 },
      { header: "Status", key: "status", width: 15 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF000000" }, // Black background
      };
      cell.font = {
        color: { argb: "FFFFFFFF" }, // White text
        bold: true,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const formatId = (id: string) => {
      if (id.startsWith("REG-")) return id;
      return `REG-${id.slice(-8).toUpperCase()}`;
    };

    // Add data
    for (const applicant of applicants) {
      const phone = normalizeIndonesianPhone(applicant.phoneNumber);

      // Format date
      const formattedDate = new Date(applicant.joinDate).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

      const row = worksheet.addRow({
        id: formatId(applicant.id),
        name: applicant.user.name || "-",
        email: applicant.user.email || "-",
        phone: phone || "-",
        date: formattedDate,
        status: applicant.status,
      });

      // Force phone cell to be treated as string so Excel doesn't drop the leading zero
      const phoneCell = row.getCell("phone");
      phoneCell.numFmt = "@"; 
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    await recordActivityLog({
      actor: admin,
      action: ACTIVITY_ACTIONS.EXPORT_APPLICANTS,
      entityType: "Export",
      details: `Mengekspor ${applicants.length} data calon anggota ke Excel (filter status: ${status}${search ? `, cari: ${search}` : ""})`,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="data-pendaftar.xlsx"',
      },
    });
  } catch (error) {
    logger.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
