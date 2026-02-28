"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReminderSchema } from "@/schemas";

export const getReminders = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return await db.reminder.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      time: "asc",
    },
  });
};

export const createReminder = async (values: z.infer<typeof ReminderSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const validatedFields = ReminderSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  const { title, description, time, daysOfWeek, isActive } = validatedFields.data;

  try {
    await db.reminder.create({
      data: {
        title,
        description,
        time,
        daysOfWeek: daysOfWeek.join(","),
        userId: session.user.id,
        isActive: isActive ?? true,
      },
    });

    revalidatePath("/automation");
    return { success: "Đã thêm nhắc nhở!" };
  } catch (error) {
    console.error(error);
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteReminder = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.reminder.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/automation");
    return { success: "Đã xóa nhắc nhở!" };
  } catch (error) {
    return { error: "Không thể xóa nhắc nhở!" };
  }
};

export const toggleReminder = async (id: string, isActive: boolean) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.reminder.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isActive,
      },
    });

    revalidatePath("/automation");
    return { success: isActive ? "Đã kích hoạt nhắc nhở!" : "Đã tạm dừng nhắc nhở!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};
