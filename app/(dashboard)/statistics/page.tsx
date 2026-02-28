import { StatsChart } from "@/components/stats/StatsChart";
import { MonthlyComparisonChart } from "@/components/stats/MonthlyComparisonChart";

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê</h1>
        <p className="text-muted-foreground">
          Theo dõi và phân tích thu chi của bạn theo thời gian
        </p>
      </div>
      <StatsChart />
      <MonthlyComparisonChart />
    </div>
  );
}
