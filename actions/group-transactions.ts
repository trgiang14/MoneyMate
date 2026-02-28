"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GroupTransactionSchema } from "@/schemas";

export const getGroupTransactions = async (groupId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return await db.groupTransaction.findMany({
    where: {
      groupId,
    },
    include: {
      payer: {
        select: {
          name: true,
          email: true,
        },
      },
      category: true,
      splits: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
};

export const createGroupTransaction = async (values: z.infer<typeof GroupTransactionSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const validatedFields = GroupTransactionSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  const { amount, description, date, categoryId, groupId, payerId, splits, splitType } = validatedFields.data;

  try {
    // 1. Kiểm tra xem người dùng có trong nhóm không
    const member = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return { error: "Bạn không phải là thành viên của nhóm này!" };
    }

    // 2. Tạo giao dịch nhóm và các khoản chia tiền
    await db.groupTransaction.create({
      data: {
        amount,
        description,
        date,
        groupId,
        payerId,
        categoryId,
        splitType,
        splits: {
          create: splits.map((split) => ({
            userId: split.userId,
            amount: split.amount || 0,
          })),
        },
      },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: "Đã thêm giao dịch nhóm thành công!" };
  } catch (error) {
    console.error(error);
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteGroupTransaction = async (transactionId: string, groupId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    const transaction = await db.groupTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return { error: "Giao dịch không tồn tại!" };
    }

    // Chỉ Admin nhóm hoặc người trả tiền mới có quyền xóa
    const member = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member || (member.role !== "ADMIN" && transaction.payerId !== session.user.id)) {
      return { error: "Bạn không có quyền xóa giao dịch này!" };
    }

    await db.groupTransaction.delete({
      where: { id: transactionId },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: "Đã xóa giao dịch thành công!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const getGroupBalances = async (groupId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  try {
    const members = await db.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const transactions = await db.groupTransaction.findMany({
      where: { groupId },
      include: {
        splits: true,
      },
    });

    // Tính toán số dư: (Số tiền đã trả) - (Số tiền phải trả theo split)
    const balances: Record<string, number> = {};
    members.forEach(m => {
      balances[m.userId] = 0;
    });

    transactions.forEach(t => {
      // Cộng tiền cho người đã trả
      if (balances[t.payerId] !== undefined) {
        balances[t.payerId] += t.amount;
      }
      
      // Trừ tiền cho những người trong split
      t.splits.forEach(s => {
        if (balances[s.userId] !== undefined) {
          balances[s.userId] -= s.amount;
        }
      });
    });

    return members.map(m => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      balance: balances[m.userId],
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
