import { useTranslations } from "next-intl";
import { StatsChart } from "@/components/stats/StatsChart";
import { MonthlyComparisonChart } from "@/components/stats/MonthlyComparisonChart";
import { AnomalyDetection } from "@/components/stats/AnomalyDetection";
import { SpendingHabits } from "@/components/stats/SpendingHabits";

export default function StatisticsPage() {
  const t = useTranslations("Statistics");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <AnomalyDetection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsChart />
        <SpendingHabits />
      </div>
      <MonthlyComparisonChart />
    </div>
  );
}
