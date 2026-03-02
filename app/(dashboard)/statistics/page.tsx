import { StatsChart } from "@/components/stats/StatsChart";
import { MonthlyComparisonChart } from "@/components/stats/MonthlyComparisonChart";
import { AnomalyDetection } from "@/components/stats/AnomalyDetection";
import { SpendingHabits } from "@/components/stats/SpendingHabits";

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê</h1>
        <p className="text-muted-foreground">
          Theo dõi và phân tích thu chi của bạn theo thời gian
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
