"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BillSchema } from "@/schemas";

export const getBills = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return await db.bill.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });
};

export const createBill = async (values: z.infer<typeof BillSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const validatedFields = BillSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  const { name, amount, dueDate, description, categoryId, isActive } = validatedFields.data;

  try {
    await db.bill.create({
      data: {
        name,
        amount,
        dueDate,
        description,
        categoryId,
        userId: session.user.id,
        isActive: isActive ?? true,
      },
    });

    revalidatePath("/automation");
    return { success: "Đã thêm hóa đơn!" };
  } catch (error) {
    console.error(error);
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteBill = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.bill.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/automation");
    return { success: "Đã xóa hóa đơn!" };
  } catch (error) {
    return { error: "Không thể xóa hóa đơn!" };
  }
};

export const toggleBill = async (id: string, isActive: boolean) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.bill.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isActive,
      },
    });

    revalidatePath("/automation");
    return { success: isActive ? "Đã kích hoạt hóa đơn!" : "Đã tạm dừng hóa đơn!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};
