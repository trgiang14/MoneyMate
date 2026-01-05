import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Receipt, Tag, LogOut, Wallet, Settings } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Wallet className="w-8 h-8" />
            <span>MoneyMate</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Tổng quan
            </Link>
            <Link href="/transactions" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Receipt className="w-4 h-4" />
              Giao dịch
            </Link>
            <Link href="/categories" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Tag className="w-4 h-4" />
              Danh mục
            </Link>
            <Link href="/settings" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Settings className="w-4 h-4" />
              Cài đặt
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block">
              {session?.user?.name}
            </span>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <Button variant="ghost" size="icon" type="submit">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MoneyMate. Tất cả các quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}

