"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const INITIAL_BADGES = [
  {
    id: "first-saving-goal",
    name: "Tiết kiệm đầu tay",
    description: "Hoàn thành mục tiêu tiết kiệm đầu tiên của bạn",
    icon: "Target",
    category: "SAVING",
  },
  {
    id: "consistency-7-days",
    name: "Người dùng chăm chỉ",
    description: "Nhập chi tiêu liên tiếp trong 7 ngày",
    icon: "CalendarCheck",
    category: "CONSISTENCY",
  },
  {
    id: "budget-master",
    name: "Kỷ luật thép",
    description: "Không vượt quá bất kỳ ngân sách nào trong một tháng",
    icon: "ShieldCheck",
    category: "SPENDING",
  },
  {
    id: "super-saver",
    name: "Siêu tiết kiệm",
    description: "Tiết kiệm được 50% tổng thu nhập trong một tháng",
    icon: "Zap",
    category: "SAVING",
  },
];

export const seedBadges = async () => {
  for (const badge of INITIAL_BADGES) {
    await db.badge.upsert({
      where: { id: badge.id },
      update: badge,
      create: badge,
    });
  }
};

export const getUserBadges = async () => {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
};

export const checkAndAwardBadges = async () => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Chưa đăng nhập" };

  const userId = session.user.id;
  const earnedBadges: string[] = [];

  // 1. Kiểm tra "Tiết kiệm đầu tay"
  const completedGoal = await db.savingGoal.findFirst({
    where: {
      userId,
      currentAmount: { gte: db.savingGoal.fields.targetAmount },
    },
  });

  if (completedGoal) {
    const earned = await awardBadge(userId, "first-saving-goal");
    if (earned) earnedBadges.push("Tiết kiệm đầu tay");
  }

  // 2. Kiểm tra "Người dùng chăm chỉ" (7 ngày liên tiếp có giao dịch)
  // Logic này phức tạp hơn, tạm thời kiểm tra xem có ít nhất 7 giao dịch trong 7 ngày qua không
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentTransactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo },
    },
    select: { date: true },
  });

  const uniqueDays = new Set(recentTransactions.map(t => t.date.toDateString()));
  if (uniqueDays.size >= 7) {
    const earned = await awardBadge(userId, "consistency-7-days");
    if (earned) earnedBadges.push("Người dùng chăm chỉ");
  }

  // 3. Kiểm tra "Siêu tiết kiệm" (Tháng trước)
  const now = new Date();
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const lastMonthTransactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: firstDayLastMonth, lte: lastDayLastMonth },
    },
  });

  const income = lastMonthTransactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = lastMonthTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  if (income > 0 && (income - expense) / income >= 0.5) {
    const earned = await awardBadge(userId, "super-saver");
    if (earned) earnedBadges.push("Siêu tiết kiệm");
  }

  if (earnedBadges.length > 0) {
    revalidatePath("/dashboard");
    return { success: `Chúc mừng! Bạn đã nhận được huy hiệu: ${earnedBadges.join(", ")}` };
  }

  return { success: "Đã kiểm tra huy hiệu" };
};

const awardBadge = async (userId: string, badgeId: string) => {
  const existing = await db.userBadge.findUnique({
    where: {
      userId_badgeId: { userId, badgeId },
    },
  });

  if (existing) return false;

  await db.userBadge.create({
    data: { userId, badgeId },
  });

  return true;
};
