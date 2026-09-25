import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const whereClause: any = {};

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
      include: {
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
      // Handle phone number formatting
      let phone = applicant.phoneNumber || "";
      if (phone.startsWith("8")) {
        phone = "0" + phone;
      } else if (phone.startsWith("62")) {
        phone = "0" + phone.slice(2);
      } else if (phone.startsWith("+62")) {
        phone = "0" + phone.slice(3);
      }

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

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="data-pendaftar.xlsx"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
