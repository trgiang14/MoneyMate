"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const BudgetSchema = z.object({
  amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
  month: z.number().min(1).max(12),
  year: z.number(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
});

export const getBudgets = async (month: number, year: number) => {
  const session = await auth();
  if (!session?.user?.id) return [];

  const budgets = await db.budget.findMany({
    where: {
      userId: session.user.id,
      month,
      year,
    },
    include: {
      category: true,
    },
  });

  // Tính toán số tiền đã chi tiêu cho mỗi ngân sách
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
      type: "EXPENSE",
    },
  });

  return budgets.map((budget) => {
    const spent = transactions
      .filter((t) => t.categoryId === budget.categoryId)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      ...budget,
      spent,
      remaining: budget.amount - spent,
      percent: Math.min(Math.round((spent / budget.amount) * 100), 100),
    };
  });
};

export const upsertBudget = async (values: z.infer<typeof BudgetSchema>) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bạn cần đăng nhập!" };

  const validatedFields = BudgetSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Thông tin không hợp lệ!" };

  const { amount, month, year, categoryId } = validatedFields.data;

  try {
    await db.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId,
          month,
          year,
        },
      },
      update: { amount },
      create: {
        amount,
        month,
        year,
        categoryId,
        userId: session.user.id,
      },
    });

    revalidatePath("/budgets");
    return { success: "Đã cập nhật ngân sách!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteBudget = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bạn cần đăng nhập!" };

  try {
    await db.budget.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/budgets");
    return { success: "Đã xóa ngân sách!" };
  } catch (error) {
    return { error: "Không thể xóa ngân sách!" };
  }
};
