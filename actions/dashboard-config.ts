"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/dashboard-constants";

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
    return { error: "Ban can dang nhap!" };
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
    return { success: "Da cap nhat cau hinh Dashboard!" };
  } catch (error) {
    console.error("Error updating dashboard config:", error);
    return { error: "Da co loi xay ra!" };
  }
};

