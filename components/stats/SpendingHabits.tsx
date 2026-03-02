"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSpendingHabits } from "@/actions/stats";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Loader2, Clock, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SpendingHabits() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSpendingHabits();
        setData(result);
      } catch (error) {
        console.error("Lỗi khi tải thói quen chi tiêu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Thói quen chi tiêu</CardTitle>
        <CardDescription>Phân tích thời điểm bạn thường xuyên chi tiêu nhất (3 tháng qua)</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="hourly" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Theo giờ
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Theo thứ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Tổng chi"]}
                  labelFormatter={(label) => `Lúc ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {data.hourly.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount > 0 ? "var(--primary)" : "#e2e8f0"} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="weekly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weekly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Tổng chi"]}
                  labelFormatter={(label) => `Thứ: ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {data.weekly.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="var(--primary)" 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
          <p className="text-sm font-medium flex items-center gap-2">
            💡 <span className="text-foreground">Nhận xét:</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {data.hourly.reduce((max: any, curr: any) => curr.amount > max.amount ? curr : max, data.hourly[0]).amount > 0 ? (
              <>Bạn thường chi tiêu nhiều nhất vào khoảng <b>{data.hourly.reduce((max: any, curr: any) => curr.amount > max.amount ? curr : max, data.hourly[0]).hour}</b> và vào <b>{data.weekly.reduce((max: any, curr: any) => curr.amount > max.amount ? curr : max, data.weekly[0]).day}</b> hàng tuần.</>
            ) : (
              <>Hãy nhập thêm giao dịch để hệ thống phân tích thói quen của bạn.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
