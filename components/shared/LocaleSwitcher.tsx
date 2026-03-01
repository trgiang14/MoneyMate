'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter, routing} from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    router.replace(pathname, {locale: nextLocale});
  }

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-[120px] bg-transparent border-none focus:ring-0 font-semibold text-slate-600">
        <Globe className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {cur === 'vi' ? 'Tiếng Việt' : 'English'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
