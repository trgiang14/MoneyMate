"use strict";
"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ProfileSchema, PasswordSchema } from "@/schemas";
import { getExchangeRate } from "@/lib/currencies";

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

export const updateCurrency = async (currency: string, convertOldTransactions: boolean = false) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Chưa đăng nhập!" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true },
    });

    const oldCurrency = user?.currency || "VND";

    // Cập nhật đơn vị tiền tệ mới
    await db.user.update({
      where: { id: session.user.id },
      data: { currency },
    });

    // Nếu người dùng chọn quy đổi giao dịch cũ
    if (convertOldTransactions && oldCurrency !== currency) {
      const rate = await getExchangeRate(oldCurrency, currency);

      if (rate !== 1) {
        // Lấy tất cả giao dịch của người dùng
        const transactions = await db.transaction.findMany({
          where: { userId: session.user.id }
        });

        // Cập nhật từng giao dịch để kiểm tra logic khôi phục số tiền gốc
        for (const transaction of transactions) {
          let newAmount: number;
          
          // Nếu đổi về đơn vị tiền tệ gốc của giao dịch đó -> khôi phục số tiền gốc để tránh sai số
          if (transaction.originalCurrency === currency && transaction.originalAmount) {
            newAmount = transaction.originalAmount;
          } else {
            // Ngược lại thì nhân với tỷ giá
            newAmount = transaction.amount * rate;
          }

          await db.transaction.update({
            where: { id: transaction.id },
            data: { amount: newAmount }
          });
        }

        // Tương tự cho ngân sách (Budget)
        const budgets = await db.budget.findMany({
          where: { userId: session.user.id }
        });

        for (const budget of budgets) {
          let newAmount: number;
          
          if (budget.originalCurrency === currency && budget.originalAmount) {
            newAmount = budget.originalAmount;
          } else {
            newAmount = budget.amount * rate;
          }

          await db.budget.update({
            where: { id: budget.id },
            data: { amount: newAmount }
          });
        }

        // Cập nhật các bảng khác tương tự nếu cần (Bill, RecurringTransaction...)
      }
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    
    return { 
      success: convertOldTransactions 
        ? `Đã chuyển đổi sang ${currency} và quy đổi các giao dịch cũ!` 
        : `Đã chuyển đổi sang ${currency}!` 
    };
  } catch (error) {
    console.error("Lỗi cập nhật tiền tệ:", error);
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const getUserCurrency = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return "VND";
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true },
    });

    return user?.currency || "VND";
  } catch (error) {
    return "VND";
  }
};

