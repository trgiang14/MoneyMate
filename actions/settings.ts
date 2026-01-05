"use strict";
"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ProfileSchema, PasswordSchema } from "@/schemas";

export const updateProfile = async (values: z.infer<typeof ProfileSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Chưa đăng nhập!" };
  }

  const validatedFields = ProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { name: validatedFields.data.name },
    });

    revalidatePath("/settings");
    return { success: "Cập nhật tên thành công!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const updatePassword = async (values: z.infer<typeof PasswordSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Chưa đăng nhập!" };
  }

  const validatedFields = PasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.password) {
    return { error: "Người dùng không hợp lệ!" };
  }

  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordsMatch) {
    return { error: "Mật khẩu hiện tại không chính xác!" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: "Đổi mật khẩu thành công!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

