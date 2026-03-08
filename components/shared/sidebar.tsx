"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  Tag, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Wallet,
  LogOut,
  Menu,
  BarChart3,
  PieChart,
  Target,
  Repeat,
  Users,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/actions/logout";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SidebarProps {
  userName?: string | null;
}

export const Sidebar = ({ userName }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const sidebarT = useTranslations('Sidebar');

  const routes = [
    {
      label: t('dashboard') || "Tổng quan",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname.includes("/dashboard"),
    },
    {
      label: t('transactions') || "Giao dịch",
      icon: Receipt,
      href: "/transactions",
      active: pathname.includes("/transactions"),
    },
    {
      label: t('categories') || "Danh mục",
      icon: Tag,
      href: "/categories",
      active: pathname.includes("/categories"),
    },
    {
      label: t('statistics') || "Thống kê",
      icon: BarChart3,
      href: "/statistics",
      active: pathname.includes("/statistics"),
    },
    {
      label: t('budgets') || "Ngân sách",
      icon: PieChart,
      href: "/budgets",
      active: pathname.includes("/budgets"),
    },
    {
      label: t('savingGoals') || "Mục tiêu",
      icon: Target,
      href: "/saving-goals",
      active: pathname.includes("/saving-goals"),
    },
    {
      label: t('automation') || "Tự động hóa",
      icon: Repeat,
      href: "/automation",
      active: pathname.includes("/automation"),
    },
    {
      label: t('groups') || "Nhóm chi tiêu",
      icon: Users,
      href: "/groups",
      active: pathname.includes("/groups"),
    },
    {
      label: t('badges') || "Huy hiệu",
      icon: Trophy,
      href: "/badges",
      active: pathname.includes("/badges"),
    },
    {
      label: t('settings') || "Cài đặt",
      icon: Settings,
      href: "/settings",
      active: pathname.includes("/settings"),
    },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)} className="bg-white shadow-sm">
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r z-40 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-8 min-h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Wallet className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-foreground whitespace-nowrap">MoneyMate</span>
            )}
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {routes.map((route) => (
            <Tooltip key={route.href}>
              <TooltipTrigger asChild>
                <Link
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative",
                    route.active 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <route.icon className={cn("w-5 h-5 shrink-0", route.active ? "" : "group-hover:text-primary")} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">{route.label}</span>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  {route.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Bottom area: User & Logout */}
        <div className="p-3 border-t border-border space-y-2">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && <span className="text-xs font-medium text-muted-foreground">{sidebarT('theme')}</span>}
            <ThemeToggle />
          </div>

          {!isCollapsed && userName && (
            <div className="px-3 py-2 text-sm font-medium text-muted-foreground truncate">
              {sidebarT('greeting')}, {userName}
            </div>
          )}
          
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center gap-3 px-3 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
              isCollapsed && "justify-center"
            )}
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{sidebarT('logout')}</span>}
          </Button>

          {/* Collapse toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex w-full mt-2 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main content wrapper adjustment */}
      <style jsx global>{`
        body {
          --sidebar-width: ${isCollapsed ? '80px' : '256px'};
        }
        @media (min-width: 1024px) {
          .main-content {
            margin-left: var(--sidebar-width);
          }
        }
      `}</style>
    </TooltipProvider>
  );
};

