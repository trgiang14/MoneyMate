"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  const routes = [
    {
      label: "Tổng quan",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Giao dịch",
      icon: Receipt,
      href: "/transactions",
      active: pathname === "/transactions",
    },
    {
      label: "Danh mục",
      icon: Tag,
      href: "/categories",
      active: pathname === "/categories",
    },
    {
      label: "Cài đặt",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
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
          "fixed left-0 top-0 h-full bg-white border-r z-40 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-8 min-h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Wallet className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-primary whitespace-nowrap">MoneyMate</span>
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
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
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
        <div className="p-3 border-t space-y-2">
          {!isCollapsed && userName && (
            <div className="px-3 py-2 text-sm font-medium text-muted-foreground truncate">
              Chào, {userName}
            </div>
          )}
          
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center gap-3 px-3 justify-start text-destructive hover:bg-red-50 hover:text-destructive",
              isCollapsed && "justify-center"
            )}
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Đăng xuất</span>}
          </Button>

          {/* Collapse toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex w-full mt-2 items-center justify-center text-muted-foreground"
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

