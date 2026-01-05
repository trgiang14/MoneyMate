"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CategorySchema } from "@/schemas";

export const getCategories = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const userId = session.user.id;

  let categories = await db.category.findMany({
    where: {
      OR: [
        { userId: userId },
        { isDefault: true }
      ]
    },
    orderBy: {
      name: "asc"
    }
  });

  // If user has no categories, seed them
  if (categories.length === 0) {
    await db.category.createMany({
      data: DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        userId: userId,
        isDefault: false
      }))
    });

    categories = await db.category.findMany({
      where: { userId: userId },
      orderBy: { name: "asc" }
    });
  }

  return categories;
};

export const createCategory = async (values: z.infer<typeof CategorySchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const validatedFields = CategorySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  try {
    const category = await db.category.create({
      data: {
        ...validatedFields.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/categories");
    return { success: "Đã tạo danh mục!", data: category };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra khi tạo danh mục!" };
  }
};

export const deleteCategory = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    await db.category.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/categories");
    return { success: "Đã xóa danh mục!" };
  } catch (error) {
    return { error: "Không thể xóa danh mục này!" };
  }
};

