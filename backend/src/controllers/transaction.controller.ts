import { Response } from 'express';
import prisma from '../lib/prisma';

export const getTransactions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, categoryId } = req.query;

    const where: any = { user_id: userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const createTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { category_id, amount, date, note } = req.body;

    if (!category_id || amount === undefined) {
      res.status(400).json({ message: 'Danh mục và số tiền là bắt buộc' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        category_id,
        amount,
        date: date ? new Date(date) : new Date(),
        note
      },
      include: {
        category: true
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const updateTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { category_id, amount, date, note } = req.body;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existingTransaction) {
      res.status(404).json({ message: 'Không tìm thấy giao dịch' });
      return;
    }

    if (existingTransaction.user_id !== userId) {
      res.status(403).json({ message: 'Bạn không có quyền sửa giao dịch này' });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        category_id,
        amount,
        date: date ? new Date(date) : new Date(existingTransaction.date),
        note
      },
      include: {
        category: true
      }
    });

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const deleteTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existingTransaction) {
      res.status(404).json({ message: 'Không tìm thấy giao dịch' });
      return;
    }

    if (existingTransaction.user_id !== userId) {
      res.status(403).json({ message: 'Bạn không có quyền xóa giao dịch này' });
      return;
    }

    await prisma.transaction.delete({
      where: { id }
    });

    res.json({ message: 'Xóa giao dịch thành công' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

