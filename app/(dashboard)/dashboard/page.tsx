"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Settings2,
  Eye,
  EyeOff,
  GripVertical,
  Loader2
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getTransactions } from "@/actions/transactions";
import { getBudgets } from "@/actions/budgets";
import { getDashboardConfig, updateDashboardConfig } from "@/actions/dashboard-config";
import { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/dashboard-constants";
import { cn } from "@/lib/utils";
import { getUserCurrency } from "@/actions/settings";
import { formatCurrency as formatCurrencyHelper } from "@/lib/currencies";
import { BadgeCollection } from "@/components/badges/BadgeCollection";
import { seedBadges } from "@/actions/badges";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [layout, setLayout] = useState<any[]>([]);
  const [currency, setCurrency] = useState("VND");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Đảm bảo huy hiệu được khởi tạo
      await seedBadges();

      const now = new Date();
      const [transactionsData, budgetsData, configData, userCurrency] = await Promise.all([
        getTransactions(),
        getBudgets(now.getMonth() + 1, now.getFullYear()),
        getDashboardConfig(),
        getUserCurrency(),
      ]);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setCurrency(userCurrency);
      
      // Ensure layout is always an array
      if (configData && Array.isArray(configData.layout)) {
        setLayout(configData.layout);
      } else {
        setLayout(DEFAULT_DASHBOARD_LAYOUT);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      setLayout(DEFAULT_DASHBOARD_LAYOUT);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Use a derived layout to ensure we always have something to render
  const activeLayout = useMemo(() => {
    return (Array.isArray(layout) && layout.length > 0) ? layout : DEFAULT_DASHBOARD_LAYOUT;
  }, [layout]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const result = await updateDashboardConfig(activeLayout);
      if (result.success) {
        toast.success(result.success);
        setIsConfigOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Lỗi khi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWidgetVisibility = (id: string) => {
    setLayout(prev => {
      const currentLayout = (Array.isArray(prev) && prev.length > 0) ? prev : DEFAULT_DASHBOARD_LAYOUT;
      return currentLayout.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return formatCurrencyHelper(amount, currency);
  };

  const recentTransactions = transactions.slice(0, 5);
  const overBudgets = budgets.filter(b => b.percent >= 80);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render Widgets based on layout
  const renderWidget = (widgetId: string) => {
    const widget = activeLayout.find(w => w.id === widgetId);
    if (!widget || !widget.visible) return null;

    switch (widgetId) {
      case "overBudgets":
        if (overBudgets.length === 0) return null;
        return (
          <div key="overBudgets" className="space-y-3">
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
        );

      case "summary":
        return (
          <div key="summary" className="grid gap-4 md:grid-cols-3">
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
        );

      case "recentTransactions":
        return (
          <Card key="recentTransactions" className="shadow-sm">
            <CardHeader>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>
                5 giao dịch mới nhất của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
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
        );

      case "categoryDistribution":
        return (
          <Card key="categoryDistribution" className="shadow-sm">
            <CardHeader>
              <CardTitle>Phân bổ chi tiêu</CardTitle>
              <CardDescription>
                Tỷ lệ chi tiêu theo danh mục
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md mt-2">
              <p className="text-sm text-muted-foreground italic">Biểu đồ sẽ được cập nhật trong phiên bản tiếp theo</p>
            </CardContent>
          </Card>
        );

      case "badges":
        return <BadgeCollection key="badges" />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground">
            Theo dõi tình hình tài chính của bạn
          </p>
        </div>
        
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Tùy chỉnh Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tùy chỉnh Dashboard</DialogTitle>
              <DialogDescription>
                Bật/tắt các thành phần hiển thị trên trang tổng quan của bạn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {activeLayout.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <span className="text-sm font-medium">{widget.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {widget.visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <Switch 
                      checked={widget.visible} 
                      onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Hủy</Button>
              <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {activeLayout.map(w => renderWidget(w.id))}
      </div>
    </div>
  );
}

