"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const DEFAULT_DASHBOARD_LAYOUT = [
  { id: "overBudgets", visible: true, title: "Cảnh báo ngân sách" },
  { id: "summary", visible: true, title: "Thống kê tổng quan" },
  { id: "recentTransactions", visible: true, title: "Giao dịch gần đây" },
  { id: "categoryDistribution", visible: true, title: "Phân bổ chi tiêu" },
];

export const getDashboardConfig = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { layout: DEFAULT_DASHBOARD_LAYOUT };
  }

  try {
    const config = await db.userDashboardConfig.findUnique({
      where: { userId: session.user.id },
    });

    if (!config) {
      return { layout: DEFAULT_DASHBOARD_LAYOUT };
    }

    return { layout: JSON.parse(config.layout) };
  } catch (error) {
    console.error("Error fetching dashboard config:", error);
    return { layout: DEFAULT_DASHBOARD_LAYOUT };
  }
};

export const updateDashboardConfig = async (layout: any[]) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.userDashboardConfig.upsert({
      where: { userId: session.user.id },
      update: { layout: JSON.stringify(layout) },
      create: {
        userId: session.user.id,
        layout: JSON.stringify(layout),
      },
    });

    revalidatePath("/dashboard");
    return { success: "Đã cập nhật cấu hình Dashboard!" };
  } catch (error) {
    console.error("Error updating dashboard config:", error);
    return { error: "Đã có lỗi xảy ra!" };
  }
};
