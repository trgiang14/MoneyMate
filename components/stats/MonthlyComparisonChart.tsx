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
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthlyComparison } from "@/actions/stats";
import { useTranslations, useLocale } from "next-intl";

export function MonthlyComparisonChart() {
  const t = useTranslations("Statistics.comparison");
  const locale = useLocale();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getMonthlyComparison(6);
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch comparison stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: locale === "vi" ? "VND" : "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
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
                  dataKey="month" 
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
                  formatter={(value: number) => [formatCurrency(value), ""]}
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
  );
}
