"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears, format, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval, subMonths } from "date-fns";
import { vi } from "date-fns/locale";

export type Period = "day" | "month" | "year";

export async function getStats(period: Period, date: Date) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const userId = session.user.id;
  let startDate: Date;
  let endDate: Date;
  let dateFormat: string;

  // Determine date range based on period
  switch (period) {
    case "day":
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      dateFormat = "dd";
      break;
    case "month":
      startDate = startOfYear(date);
      endDate = endOfYear(date);
      dateFormat = "MM";
      break;
    case "year":
      startDate = startOfYear(subYears(date, 4)); // Last 5 years
      endDate = endOfYear(date);
      dateFormat = "yyyy";
      break;
    default:
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      dateFormat = "dd";
  }

  // Fetch transactions
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      amount: true,
      type: true,
    },
  });

  // Group data
  const groupedData: Record<string, { income: number; expense: number }> = {};

  // Initialize all periods with 0
  let periods: Date[] = [];
  if (period === "day") {
    periods = eachDayOfInterval({ start: startDate, end: endDate });
  } else if (period === "month") {
    periods = eachMonthOfInterval({ start: startDate, end: endDate });
  } else if (period === "year") {
    periods = eachYearOfInterval({ start: startDate, end: endDate });
  }

  periods.forEach((p) => {
    const key = format(p, dateFormat);
    groupedData[key] = { income: 0, expense: 0 };
  });

  // Aggregate transactions
  transactions.forEach((t) => {
    const key = format(t.date, dateFormat);
    if (groupedData[key]) {
      if (t.type === "INCOME") {
        groupedData[key].income += t.amount;
      } else {
        groupedData[key].expense += t.amount;
      }
    }
  });

  // Format for chart
  const chartData = periods.map((p) => {
    const key = format(p, dateFormat);
    let label = key;
    
    if (period === "day") label = format(p, "dd/MM", { locale: vi });
    if (period === "month") label = format(p, "MM/yyyy", { locale: vi });
    if (period === "year") label = format(p, "yyyy", { locale: vi });

    return {
      label,
      income: groupedData[key].income,
      expense: groupedData[key].expense,
      date: p.toISOString(),
    };
  });

  return { data: chartData };
}

export async function getCategoryStats(period: Period, date: Date) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const userId = session.user.id;
  let startDate: Date;
  let endDate: Date;

  // Determine date range based on period
  switch (period) {
    case "day":
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      break;
    case "month":
      startDate = startOfYear(date);
      endDate = endOfYear(date);
      break;
    case "year":
      startDate = startOfYear(subYears(date, 4));
      endDate = endOfYear(date);
      break;
    default:
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
  }

  const stats = await db.transaction.groupBy({
    by: ['categoryId', 'type'],
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const categories = await db.category.findMany({
    where: {
      id: {
        in: stats.map((s) => s.categoryId),
      },
    },
  });

  const data = stats.map((s) => {
    const category = categories.find((c) => c.id === s.categoryId);
    return {
      name: category?.name || "Unknown",
      value: s._sum.amount || 0,
      color: category?.color || "#94a3b8",
      type: s.type,
    };
  });

  return { 
    income: data.filter((d) => d.type === "INCOME").sort((a, b) => b.value - a.value),
    expense: data.filter((d) => d.type === "EXPENSE").sort((a, b) => b.value - a.value),
  };
}

export async function getMonthlyComparison(monthsCount: number = 6) {
  // ... existing code ...
}

export async function detectAnomalies() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const userId = session.user.id;
  const now = new Date();
  const thirtyDaysAgo = subMonths(now, 1);

  // 1. Lấy các giao dịch trong 30 ngày qua
  const recentTransactions = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // 2. Lấy dữ liệu lịch sử để tính trung bình (3 tháng trước đó)
  const historyStart = subMonths(thirtyDaysAgo, 3);
  const historicalTransactions = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: historyStart,
        lt: thirtyDaysAgo,
      },
    },
  });

  // Tính trung bình chi tiêu mỗi giao dịch theo từng danh mục
  const categoryAverages: Record<string, { total: number; count: number; avg: number }> = {};
  
  historicalTransactions.forEach((t) => {
    if (!categoryAverages[t.categoryId]) {
      categoryAverages[t.categoryId] = { total: 0, count: 0, avg: 0 };
    }
    categoryAverages[t.categoryId].total += t.amount;
    categoryAverages[t.categoryId].count += 1;
  });

  Object.keys(categoryAverages).forEach((id) => {
    categoryAverages[id].avg = categoryAverages[id].total / categoryAverages[id].count;
  });

  // 3. Phát hiện bất thường: Giao dịch cao hơn 2 lần trung bình danh mục đó
  const anomalies = recentTransactions.filter((t) => {
    const avgData = categoryAverages[t.categoryId];
    // Chỉ cảnh báo nếu đã có lịch sử chi tiêu (> 3 giao dịch) và số tiền > 200k để tránh cảnh báo rác
    if (avgData && avgData.count >= 3) {
      return t.amount > avgData.avg * 2 && t.amount > 200000;
    }
    return false;
  }).map(t => ({
    ...t,
    average: categoryAverages[t.categoryId].avg
  }));

  return { data: anomalies };
}
