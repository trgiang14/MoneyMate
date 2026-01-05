import Link from "next/link";
import { Wallet, CheckCircle2, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Wallet className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">MoneyMate</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Đăng nhập
          </Link>
          <Link href="/register">
            <Button size="sm">Bắt đầu ngay</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-slate-900">
                Làm chủ tài chính, kiến tạo tương lai cùng <span className="text-primary">MoneyMate</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl">
                Ứng dụng đơn giản, thông minh giúp bạn theo dõi thu chi, lập kế hoạch ngân sách và đạt được mục tiêu tài chính nhanh hơn bao giờ hết.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Link href="/register">
                  <Button size="lg" className="px-8 text-lg">
                    Đăng ký miễn phí <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 text-lg">
                    Đăng nhập ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Tính năng nổi bật</h2>
              <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Mọi thứ bạn cần để quản lý túi tiền hiệu quả trong tầm tay</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 rounded-full mb-4 text-blue-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ghi chép dễ dàng</h3>
                <p className="text-center text-slate-500">Ghi lại các khoản thu và chi chỉ trong vài giây với giao diện trực quan và phân loại thông minh.</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-100 rounded-full mb-4 text-emerald-600">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Báo cáo trực quan</h3>
                <p className="text-center text-slate-500">Theo dõi dòng tiền qua các biểu đồ sinh động, giúp bạn hiểu rõ thói quen chi tiêu của bản thân.</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-3 bg-orange-100 rounded-full mb-4 text-orange-600">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bảo mật tuyệt đối</h3>
                <p className="text-center text-slate-500">Dữ liệu của bạn được mã hóa và bảo vệ an toàn, giúp bạn yên tâm quản lý tài chính cá nhân.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Bắt đầu hành trình tự do tài chính ngay hôm nay
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl mb-8">
              Gia nhập cùng hàng ngàn người dùng đang sử dụng MoneyMate để quản lý tài chính mỗi ngày.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-10 text-lg font-semibold">
                Tham gia ngay - Hoàn toàn miễn phí
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">MoneyMate</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} MoneyMate. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex gap-4">
              <Link className="text-sm text-slate-500 hover:text-primary" href="#">Điều khoản</Link>
              <Link className="text-sm text-slate-500 hover:text-primary" href="#">Bảo mật</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

