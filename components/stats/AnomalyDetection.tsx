"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { detectAnomalies } from "@/actions/stats";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";

export function AnomalyDetection() {
  const t = useTranslations("Statistics.anomaly");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await detectAnomalies();
        if (result.data) {
          setAnomalies(result.data);
        }
      } catch (error) {
        console.error("Failed to detect anomalies:", error);
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (anomalies.length === 0) {
    return (
      <Card className="bg-emerald-50/50 border-emerald-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Info className="h-5 w-5" />
            <CardTitle className="text-lg">{t("stable")}</CardTitle>
          </div>
          <CardDescription className="text-emerald-600">
            {t("stableDesc")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle className="text-lg">{t("warning")}</CardTitle>
        </div>
        <CardDescription>
          {t("warningDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {anomalies.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900">{item.category?.name}</span>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  {format(new Date(item.date), "dd/MM/yyyy", { locale: dateLocale })}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-xs text-amber-600 font-medium">
                {t("timesAverage", { 
                  times: (item.amount / item.average).toFixed(1),
                  average: formatCurrency(item.average)
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-destructive">
                {formatCurrency(item.amount)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
