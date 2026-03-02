"use client";

import { BadgeCollection } from "@/components/badges/BadgeCollection";

export default function BadgesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Huy hiệu thành tựu</h1>
        <p className="text-muted-foreground">
          Theo dõi những cột mốc và thành tích tài chính của bạn
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <BadgeCollection />
      </div>
    </div>
  );
}
