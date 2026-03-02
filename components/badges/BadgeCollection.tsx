"use client";

import { useEffect, useState } from "react";
import { Trophy, Target, ShieldCheck, Zap, CalendarCheck, Medal, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUserBadges, checkAndAwardBadges } from "@/actions/badges";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const ICON_MAP: Record<string, any> = {
  Target,
  ShieldCheck,
  Zap,
  CalendarCheck,
  Trophy,
};

export function BadgeCollection() {
  const [badgesWithStatus, setBadgesWithStatus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Đầu tiên kiểm tra và trao huy hiệu mới (nếu có)
      const checkResult = await checkAndAwardBadges();
      if (checkResult.success && checkResult.success.includes("Chúc mừng")) {
        toast.success(checkResult.success);
      }

      // Sau đó lấy danh sách huy hiệu với trạng thái
      const badges = await getUserBadges();
      setBadgesWithStatus(badges);
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

  const earnedCount = badgesWithStatus.filter(b => b.isEarned).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Bộ sưu tập huy hiệu ({earnedCount}/{badgesWithStatus.length})
        </CardTitle>
        <CardDescription>
          Hoàn thành các thử thách tài chính để mở khóa toàn bộ huy hiệu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badgesWithStatus.map((item) => {
            const IconComponent = ICON_MAP[item.badge.icon] || Trophy;
            return (
              <div 
                key={item.badge.id} 
                className={cn(
                  "flex flex-col items-center text-center p-4 rounded-xl border transition-all relative group",
                  item.isEarned 
                    ? "bg-card border-primary/20 shadow-sm hover:shadow-md" 
                    : "bg-muted/30 border-dashed opacity-60 grayscale"
                )}
              >
                {!item.isEarned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  !item.isEarned ? "bg-slate-200 text-slate-400" :
                  item.badge.category === "SAVING" ? "bg-emerald-100 text-emerald-600" :
                  item.badge.category === "SPENDING" ? "bg-blue-100 text-blue-600" :
                  "bg-orange-100 text-orange-600"
                )}>
                  <IconComponent className="h-7 w-7" />
                </div>
                
                <p className={cn(
                  "text-sm font-bold leading-tight",
                  !item.isEarned ? "text-muted-foreground" : "text-foreground"
                )}>
                  {item.badge.name}
                </p>
                
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 px-1">
                  {item.badge.description}
                </p>

                {item.isEarned && item.earnedAt && (
                  <p className="text-[9px] text-emerald-600 mt-2 font-medium">
                    Đạt được ngày {format(new Date(item.earnedAt), "dd/MM/yyyy", { locale: vi })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
