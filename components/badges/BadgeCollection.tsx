"use client";

import { useEffect, useState } from "react";
import { Trophy, Target, ShieldCheck, Zap, CalendarCheck, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUserBadges, checkAndAwardBadges } from "@/actions/badges";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  Target,
  ShieldCheck,
  Zap,
  CalendarCheck,
  Trophy,
};

export function BadgeCollection() {
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Đầu tiên kiểm tra và trao huy hiệu mới (nếu có)
      const checkResult = await checkAndAwardBadges();
      if (checkResult.success && checkResult.success.includes("Chúc mừng")) {
        toast.success(checkResult.success);
      }

      // Sau đó lấy danh sách huy hiệu hiện tại
      const badges = await getUserBadges();
      setUserBadges(badges);
    } catch (error) {
      console.error("Lỗi khi tải huy hiệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Đang tải huy hiệu...</div>;
  }

  if (userBadges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-muted-foreground" />
            Huy hiệu của bạn
          </CardTitle>
          <CardDescription>
            Bạn chưa nhận được huy hiệu nào. Hãy tiếp tục sử dụng ứng dụng để nhận thưởng!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Bộ sưu tập huy hiệu ({userBadges.length})
        </CardTitle>
        <CardDescription>
          Những thành tựu bạn đã đạt được trong hành trình quản lý tài chính
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userBadges.map((ub) => {
            const IconComponent = ICON_MAP[ub.badge.icon] || Trophy;
            return (
              <div 
                key={ub.id} 
                className="flex flex-col items-center text-center p-3 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                  ub.badge.category === "SAVING" ? "bg-emerald-100 text-emerald-600" :
                  ub.badge.category === "SPENDING" ? "bg-blue-100 text-blue-600" :
                  "bg-orange-100 text-orange-600"
                )}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold leading-tight">{ub.badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{ub.badge.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
