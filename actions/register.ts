"use strict";
"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu tối thiểu 6 ký tự",
  }),
  name: z.string().min(1, {
    message: "Tên là bắt buộc",
  }),
});

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return { error: "Email đã được sử dụng!" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: "Đăng ký thành công!" };
};

