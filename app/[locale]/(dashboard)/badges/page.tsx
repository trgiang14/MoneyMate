"use client";

import { BadgeCollection } from "@/components/badges/BadgeCollection";
import { useTranslations } from "next-intl";

export default function BadgesPage() {
  const t = useTranslations("Badges");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <BadgeCollection />
      </div>
    </div>
  );
}
