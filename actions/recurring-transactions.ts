"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RecurringTransactionSchema } from "@/schemas";
import { addDays, addWeeks, addMonths, addYears, isBefore, startOfDay } from "date-fns";

export const getRecurringTransactions = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return await db.recurringTransaction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createRecurringTransaction = async (values: z.infer<typeof RecurringTransactionSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const validatedFields = RecurringTransactionSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  const { amount, description, type, frequency, startDate, endDate, categoryId, isActive } = validatedFields.data;

  try {
    await db.recurringTransaction.create({
      data: {
        amount,
        description,
        type,
        frequency,
        startDate,
        endDate: endDate || null,
        nextRunDate: startDate, // Lần chạy đầu tiên là ngày bắt đầu
        userId: session.user.id,
        categoryId,
        isActive: isActive ?? true,
      },
    });

    revalidatePath("/automation");
    return { success: "Đã thêm khoản thu chi định kỳ!" };
  } catch (error) {
    console.error(error);
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteRecurringTransaction = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.recurringTransaction.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/automation");
    return { success: "Đã xóa khoản định kỳ!" };
  } catch (error) {
    return { error: "Không thể xóa khoản định kỳ!" };
  }
};

export const toggleRecurringTransaction = async (id: string, isActive: boolean) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.recurringTransaction.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isActive,
      },
    });

    revalidatePath("/automation");
    return { success: isActive ? "Đã kích hoạt!" : "Đã tạm dừng!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

/**
 * Hàm này sẽ được gọi để xử lý các giao dịch định kỳ đến hạn.
 * Có thể được gọi từ một API route (cron job).
 */
export const processRecurringTransactions = async () => {
  const now = new Date();
  
  // Tìm các khoản định kỳ đang hoạt động và đã đến hạn hoặc quá hạn
  const recurringToProcess = await db.recurringTransaction.findMany({
    where: {
      isActive: true,
      nextRunDate: {
        lte: now,
      },
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    }
  });

  const results = {
    processed: 0,
    created: 0,
    errors: 0
  };

  for (const recurring of recurringToProcess) {
    try {
      // 1. Tạo giao dịch thực tế
      await db.transaction.create({
        data: {
          amount: recurring.amount,
          description: recurring.description + " (Định kỳ)",
          date: recurring.nextRunDate,
          type: recurring.type,
          userId: recurring.userId,
          categoryId: recurring.categoryId,
          recurringTransactionId: recurring.id,
        }
      });

      // 2. Tính toán ngày chạy tiếp theo
      let nextRunDate = new Date(recurring.nextRunDate);
      switch (recurring.frequency) {
        case "DAILY":
          nextRunDate = addDays(nextRunDate, 1);
          break;
        case "WEEKLY":
          nextRunDate = addWeeks(nextRunDate, 1);
          break;
        case "MONTHLY":
          nextRunDate = addMonths(nextRunDate, 1);
          break;
        case "YEARLY":
          nextRunDate = addYears(nextRunDate, 1);
          break;
      }

      // 3. Cập nhật thông tin lần chạy cuối và lần chạy tiếp theo
      const isStillActive = !recurring.endDate || isBefore(nextRunDate, recurring.endDate);
      
      await db.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          lastRunDate: recurring.nextRunDate,
          nextRunDate: nextRunDate,
          isActive: isStillActive,
        }
      });

      results.created++;
      results.processed++;
    } catch (error) {
      console.error(`Error processing recurring transaction ${recurring.id}:`, error);
      results.errors++;
    }
  }

  return results;
};
