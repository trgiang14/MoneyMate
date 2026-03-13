"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, addMonths, subMonths, addYears, subYears } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStats, Period } from "@/actions/stats";
import { cn } from "@/lib/utils";
import { CategoryPieChart } from "./CategoryPieChart";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { useTranslations, useLocale } from "next-intl";

export function StatsChart() {
  const t = useTranslations("Statistics.chart");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;
  const [period, setPeriod] = useState<Period>("day");
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getStats(period, date);
      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, date]);

  const handlePrevious = () => {
    if (period === "day") setDate(subMonths(date, 1));
    if (period === "month") setDate(subYears(date, 1));
    if (period === "year") setDate(subYears(date, 5));
  };

  const handleNext = () => {
    if (period === "day") setDate(addMonths(date, 1));
    if (period === "month") setDate(addYears(date, 1));
    if (period === "year") setDate(addYears(date, 5));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: locale === "vi" ? "VND" : "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTitle = () => {
    if (period === "day") return t("monthYear", { date: format(date, "MM/yyyy", { locale: dateLocale }) });
    if (period === "month") return t("yearOnly", { date: format(date, "yyyy", { locale: dateLocale }) });
    if (period === "year") return t("last5Years");
    return "";
  };

  const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0);

  const handleExportExcel = () => {
    const fileName = `Bao_cao_thu_chi_${period}_${format(date, "yyyyMMdd")}`;
    exportToExcel(data, fileName);
  };

  const handleExportPDF = () => {
    const fileName = `Bao_cao_thu_chi_${period}_${format(date, "yyyyMMdd")}`;
    exportToPDF(data, fileName, getTitle());
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="day">{t("day")}</TabsTrigger>
              <TabsTrigger value="month">{t("month")}</TabsTrigger>
              <TabsTrigger value="year">{t("year")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t("export")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                {t("exportExcel")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                {t("exportPDF")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[150px] text-center">
            {getTitle()}
          </span>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalIncome")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalExpense")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("balance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              totalIncome - totalExpense >= 0 ? "text-primary" : "text-destructive"
            )}>
              {formatCurrency(totalIncome - totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Bar Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => 
                      new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", { notation: "compact" }).format(value)
                    }
                  />
                  <Tooltip 
                    formatter={(value: number | undefined) => [formatCurrency(value ?? 0), locale === "vi" ? "VND" : "USD"]}
                    labelStyle={{ color: "#333" }}
                  />
                  <Legend />
                  <Bar dataKey="income" name={t("income")} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t("expense")} fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pie Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryPieChart period={period} date={date} type="INCOME" />
        <CategoryPieChart period={period} date={date} type="EXPENSE" />
      </div>
    </div>
  );
}
