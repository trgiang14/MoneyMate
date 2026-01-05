"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const loginFeatures = [
  {
    title: "Bắt đầu hành trình quản lý tài chính thông minh hơn",
    description: "Theo dõi dòng tiền hàng ngày chính xác và hiệu quả.",
    points: [
      "Theo dõi dòng tiền hàng ngày chính xác",
      "Phân tích biểu đồ chi tiêu trực quan",
      "Lập kế hoạch tiết kiệm hiệu quả",
      "Truy cập mọi lúc, mọi nơi"
    ]
  },
  {
    title: "Tiết kiệm thông minh hơn mỗi ngày",
    description: "Xây dựng thói quen chi tiêu tốt để đạt được mục tiêu tương lai.",
    points: [
      "Thiết lập ngân sách chi tiêu hàng tháng",
      "Cảnh báo khi vượt quá hạn mức",
      "Theo dõi tiến độ tiết kiệm",
      "Gợi ý cắt giảm chi phí thừa"
    ]
  }
];

const registerFeatures = [
  {
    title: "Tham gia cộng đồng quản lý tài chính hiệu quả nhất",
    description: "Gia nhập cùng hàng ngàn người dùng đang tối ưu hóa túi tiền của họ.",
    steps: [
      { id: 1, title: "Đăng ký nhanh chóng", desc: "Chỉ mất 30 giây để bắt đầu hành trình mới." },
      { id: 2, title: "Cá nhân hóa danh mục", desc: "Tự tạo các loại thu chi phù hợp với lối sống." },
      { id: 3, title: "Kiểm soát dòng tiền", desc: "Xem báo cáo chi tiết ngay trên điện thoại." }
    ]
  },
  {
    title: "Dữ liệu của bạn luôn được bảo mật tuyệt đối",
    description: "Chúng tôi sử dụng công nghệ mã hóa tiên tiến nhất.",
    steps: [
      { id: 1, title: "Mã hóa đầu cuối", desc: "Dữ liệu chỉ dành riêng cho bạn." },
      { id: 2, title: "Sao lưu đám mây", desc: "Không bao giờ lo mất dữ liệu." },
      { id: 3, title: "Riêng tư tuyệt đối", desc: "Chúng tôi không chia sẻ dữ liệu cho bên thứ 3." }
    ]
  }
];

export const AuthFeatures = ({ type }: { type: "login" | "register" }) => {
  const [index, setIndex] = useState(0);
  const features = type === "login" ? loginFeatures : registerFeatures;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="relative h-full flex flex-col justify-center px-16 text-white max-w-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="space-y-8"
        >
          <h2 className="text-5xl font-bold leading-tight">
            {features[index].title}
          </h2>
          
          <p className="text-xl text-primary-foreground/70">
            {features[index].description}
          </p>

          {type === "login" ? (
            <ul className="space-y-6">
              {(features[index] as any).points?.map((text: string, i: number) => (
                <li key={i} className="flex items-center gap-4 text-lg text-primary-foreground/90">
                  <div className="bg-white/20 p-1 rounded-full shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-8">
              {(features[index] as any).steps?.map((step: any) => (
                <div key={step.id} className="flex gap-4">
                  <div className="bg-primary/20 h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary-foreground">{step.id}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{step.title}</h4>
                    <p className="text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress indicators */}
      <div className="absolute bottom-16 left-16 flex gap-2">
        {features.map((_, i) => (
          <div 
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === i ? "w-8 bg-white" : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

// Simple cn helper if needed or import from lib
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

