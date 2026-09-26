"use server";

import { revalidatePath, unstable_noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdmins() {
  unstable_noStore();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "OWNER" && role !== "SUPER_ADMIN") {
    return { data: [] };
  }

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["OWNER", "SUPER_ADMIN", "COORDINATOR", "STAFF"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return { data: admins };
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { data: [] };
  }
}

export async function createAdmin(data: { fullName: string; email: string; role: string; password?: string }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (userRole !== "OWNER" && userRole !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  // SUPER_ADMIN cannot create another SUPER_ADMIN or OWNER, only OWNER can.
  if (userRole === "SUPER_ADMIN" && (data.role === "OWNER" || data.role === "SUPER_ADMIN")) {
    return { success: false, error: "SUPER_ADMIN cannot create SUPER_ADMIN or OWNER roles." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, error: "Email sudah terdaftar." };

    const hashedPassword = await bcrypt.hash(data.password || "admin123", 10);
    await prisma.user.create({
      data: {
        name: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdmin(id: string, data: { fullName: string; email: string; role: string; status: string; password?: string }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  if (userRole !== "OWNER" && userRole !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const targetAdmin = await prisma.user.findUnique({ where: { id } });
    if (!targetAdmin) return { success: false, error: "Admin tidak ditemukan." };

    // Role restrictions:
    // OWNER can edit anyone.
    // SUPER_ADMIN can edit themselves, COORDINATOR, and STAFF.
    if (userRole === "SUPER_ADMIN") {
      if (targetAdmin.role === "OWNER") {
        return { success: false, error: "Cannot edit OWNER." };
      }
      if (targetAdmin.role === "SUPER_ADMIN" && targetAdmin.id !== userId) {
        return { success: false, error: "Cannot edit other SUPER_ADMINs." };
      }
      // SUPER_ADMIN cannot promote someone to SUPER_ADMIN or OWNER
      if (data.role === "OWNER" || (data.role === "SUPER_ADMIN" && targetAdmin.role !== "SUPER_ADMIN")) {
        return { success: false, error: "Cannot assign SUPER_ADMIN or OWNER role." };
      }
    }

    const updateData: any = {
      name: data.fullName,
      email: data.email,
      role: data.role as any,
      status: data.status as any,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdmin(id: string) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  
  if (userRole !== "OWNER" && userRole !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const targetAdmin = await prisma.user.findUnique({ where: { id } });
    if (!targetAdmin) return { success: false, error: "Admin tidak ditemukan." };

    if (targetAdmin.id === userId) {
      return { success: false, error: "Cannot delete yourself." };
    }

    if (targetAdmin.role === "OWNER") {
      return { success: false, error: "Cannot delete OWNER." };
    }

    if (userRole === "SUPER_ADMIN" && targetAdmin.role === "SUPER_ADMIN") {
      return { success: false, error: "Cannot delete other SUPER_ADMINs." };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return { success: false, error: error.message };
  }
}
