import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getCategories = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { user_id: userId },
          { user_id: null } // Danh mục hệ thống dùng chung
        ]
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const createCategory = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { name, type, icon } = req.body;

    if (!name || !type) {
      res.status(400).json({ message: 'Tên và loại danh mục là bắt buộc' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon,
        user_id: userId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const updateCategory = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, type, icon } = req.body;

    // Kiểm tra xem danh mục có thuộc về user không
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
      return;
    }

    if (existingCategory.user_id !== userId) {
      res.status(403).json({ message: 'Bạn không có quyền sửa danh mục này' });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, type, icon }
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const deleteCategory = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
      return;
    }

    if (existingCategory.user_id !== userId) {
      res.status(403).json({ message: 'Bạn không có quyền xóa danh mục này' });
      return;
    }

    // Kiểm tra xem có giao dịch nào đang sử dụng danh mục này không
    const transactionsCount = await prisma.transaction.count({
      where: { category_id: id }
    });

    if (transactionsCount > 0) {
      res.status(400).json({ message: 'Không thể xóa danh mục đang có giao dịch' });
      return;
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

