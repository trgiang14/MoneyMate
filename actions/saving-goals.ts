"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SavingGoalSchema = z.object({
  name: z.string().min(1, "Tên mục tiêu không được để trống"),
  targetAmount: z.coerce.number().min(1, "Số tiền mục tiêu phải lớn hơn 0"),
  currentAmount: z.coerce.number().min(0, "Số tiền hiện có không được âm"),
  deadline: z.date().optional().nullable(),
});

export const getSavingGoals = async () => {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.savingGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
};

export const createSavingGoal = async (values: z.infer<typeof SavingGoalSchema>) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bạn cần đăng nhập!" };

  const validatedFields = SavingGoalSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Thông tin không hợp lệ!" };

  try {
    await db.savingGoal.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/saving-goals");
    return { success: "Đã thêm mục tiêu tiết kiệm!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const updateSavingGoal = async (id: string, values: z.infer<typeof SavingGoalSchema>) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bạn cần đăng nhập!" };

  const validatedFields = SavingGoalSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Thông tin không hợp lệ!" };

  try {
    await db.savingGoal.update({
      where: { id, userId: session.user.id },
      data: validatedFields.data,
    });

    revalidatePath("/saving-goals");
    return { success: "Đã cập nhật mục tiêu!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteSavingGoal = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bạn cần đăng nhập!" };

  try {
    await db.savingGoal.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/saving-goals");
    return { success: "Đã xóa mục tiêu!" };
  } catch (error) {
    return { error: "Không thể xóa mục tiêu!" };
  }
};

export const addContribution = async (id: string, amount: number) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bạn cần đăng nhập!" };

  if (amount <= 0) return { error: "Số tiền phải lớn hơn 0!" };

  try {
    await db.savingGoal.update({
      where: { id, userId: session.user.id },
      data: {
        currentAmount: {
          increment: amount,
        },
      },
    });

    revalidatePath("/saving-goals");
    return { success: "Đã thêm tiền tiết kiệm!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};
