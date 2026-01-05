"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TransactionSchema } from "@/schemas";

export const getTransactions = async (filters?: {
  month?: number;
  year?: number;
}) => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const userId = session.user.id;
  
  let where: any = { userId };

  if (filters?.month !== undefined && filters?.year !== undefined) {
    const startDate = new Date(filters.year, filters.month, 1);
    const endDate = new Date(filters.year, filters.month + 1, 0, 23, 59, 59);
    where.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  return await db.transaction.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });
};

export const createTransaction = async (values: z.infer<typeof TransactionSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const validatedFields = TransactionSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  try {
    await db.transaction.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: "Đã thêm giao dịch!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteTransaction = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.transaction.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: "Đã xóa giao dịch!" };
  } catch (error) {
    return { error: "Không thể xóa giao dịch này!" };
  }
};

