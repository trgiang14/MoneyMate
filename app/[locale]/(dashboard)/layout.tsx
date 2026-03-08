import { auth } from "@/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { getTranslations } from "next-intl/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const t = await getTranslations('Footer');

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userName={session?.user?.name} />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 main-content">
        <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <footer className="py-6 border-t border-border bg-card/50">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear() })}
          </div>
        </footer>
      </div>
    </div>
  );
}
