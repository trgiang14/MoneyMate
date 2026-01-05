import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(1, {
    message: "Mật khẩu là bắt buộc",
  }),
});

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

export const CategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const TransactionSchema = z.object({
  amount: z.coerce.number().positive("Số tiền phải lớn hơn 0"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Ngày là bắt buộc",
  }),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
});

export const ProfileSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
});

export const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
});

