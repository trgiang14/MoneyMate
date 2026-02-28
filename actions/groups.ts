"use strict";
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GroupSchema } from "@/schemas";

export const getGroups = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return await db.group.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createGroup = async (values: z.infer<typeof GroupSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  const validatedFields = GroupSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Thông tin không hợp lệ!" };
  }

  const { name, description } = validatedFields.data;

  try {
    const group = await db.group.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
    });

    revalidatePath("/groups");
    return { success: "Đã tạo nhóm thành công!", groupId: group.id };
  } catch (error) {
    console.error(error);
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const joinGroup = async (inviteCode: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    const group = await db.group.findUnique({
      where: { inviteCode },
    });

    if (!group) {
      return { error: "Mã mời không hợp lệ!" };
    }

    const existingMember = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      return { error: "Bạn đã là thành viên của nhóm này!" };
    }

    await db.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: "MEMBER",
      },
    });

    revalidatePath("/groups");
    return { success: "Đã tham gia nhóm thành công!", groupId: group.id };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const leaveGroup = async (groupId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
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

    if (member.role === "ADMIN") {
      const otherAdmins = await db.groupMember.count({
        where: {
          groupId,
          role: "ADMIN",
          userId: { not: session.user.id },
        },
      });

      if (otherAdmins === 0) {
        return { error: "Bạn là Admin duy nhất. Hãy chỉ định Admin khác trước khi rời nhóm hoặc xóa nhóm." };
      }
    }

    await db.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    revalidatePath("/groups");
    return { success: "Đã rời nhóm thành công!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const deleteGroup = async (groupId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    const member = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member || member.role !== "ADMIN") {
      return { error: "Chỉ Admin mới có quyền xóa nhóm!" };
    }

    await db.group.delete({
      where: { id: groupId },
    });

    revalidatePath("/groups");
    return { success: "Đã xóa nhóm thành công!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};

export const removeMember = async (groupId: string, userId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Bạn cần đăng nhập!" };
  }

  try {
    const adminMember = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!adminMember || adminMember.role !== "ADMIN") {
      return { error: "Chỉ Admin mới có quyền xóa thành viên!" };
    }

    if (userId === session.user.id) {
      return { error: "Bạn không thể tự xóa chính mình. Hãy sử dụng chức năng Rời nhóm." };
    }

    await db.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: "Đã xóa thành viên khỏi nhóm!" };
  } catch (error) {
    return { error: "Đã có lỗi xảy ra!" };
  }
};
