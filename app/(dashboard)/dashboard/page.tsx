"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getTransactions } from "@/actions/transactions";
import { getBudgets } from "@/actions/budgets";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const [transactionsData, budgetsData] = await Promise.all([
        getTransactions(),
        getBudgets(now.getMonth() + 1, now.getFullYear()),
      ]);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const recentTransactions = transactions.slice(0, 5);
  const overBudgets = budgets.filter(b => b.percent >= 80);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground">
          Theo dõi tình hình tài chính của bạn
        </p>
      </div>

      {overBudgets.length > 0 && (
        <div className="space-y-3">
          {overBudgets.map(budget => (
            <div 
              key={budget.id} 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border shadow-sm animate-in fade-in slide-in-from-top-2",
                budget.percent >= 100 ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-yellow-50 border-yellow-200 text-yellow-700"
              )}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="text-sm font-bold">
                    {budget.percent >= 100 ? "Vượt ngân sách!" : "Sắp chạm hạn mức!"}
                  </p>
                  <p className="text-xs opacity-90">
                    Danh mục {budget.category.name} đã dùng {budget.percent}% hạn mức tháng này.
                  </p>
                </div>
              </div>
              <div className="text-sm font-bold">
                {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư hiện tại</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng thu nhập trừ tổng chi tiêu
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Tổng thu nhập</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Tiền vào tài khoản
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Tổng chi tiêu</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
            <div className="flex items-center text-xs text-destructive mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              Tiền ra khỏi tài khoản
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>
              5 giao dịch mới nhất của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm py-4">Đang tải...</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-sm py-4 text-muted-foreground">Chưa có giao dịch nào.</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: t.category?.color || '#94a3b8' }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{t.category?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(t.date), "dd MMM yyyy", { locale: vi })}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "text-sm font-bold",
                      t.type === "INCOME" ? "text-emerald-600" : "text-destructive"
                    )}>
                      {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Phân bổ chi tiêu</CardTitle>
            <CardDescription>
              Tỷ lệ chi tiêu theo danh mục (Sắp ra mắt)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md mt-2">
            <p className="text-sm text-muted-foreground italic">Biểu đồ sẽ được cập nhật trong phiên bản tiếp theo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

