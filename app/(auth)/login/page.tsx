"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Wallet, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LoginSchema } from "@/schemas";
import { login } from "@/actions/login";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsPending(true);
    
    try {
      const data = await login(values);
      if (data?.error) {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Decoration/Marketing */}
      <div className="hidden lg:flex flex-1 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600" />
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white max-w-2xl">
          <h2 className="text-5xl font-bold leading-tight mb-8">
            Bắt đầu hành trình <br /> quản lý tài chính <br /> thông minh hơn
          </h2>
          
          <ul className="space-y-6">
            {[
              "Theo dõi dòng tiền hàng ngày chính xác",
              "Phân tích biểu đồ chi tiêu trực quan",
              "Lập kế hoạch tiết kiệm hiệu quả",
              "Truy cập mọi lúc, mọi nơi"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 text-lg text-primary-foreground/90">
                <div className="bg-white/20 p-1 rounded-full shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-16 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <p className="italic text-lg text-primary-foreground/80 leading-relaxed">
              "MoneyMate đã giúp mình tiết kiệm được 20% thu nhập hàng tháng chỉ bằng cách theo dõi các khoản chi nhỏ lẻ thường bị bỏ quên."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20" />
              <div>
                <p className="font-bold text-sm">Minh Anh</p>
                <p className="text-xs text-primary-foreground/60">Người dùng tại Hà Nội</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center lg:items-start">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <Wallet className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-primary tracking-tight">MoneyMate</span>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chào mừng quay trở lại</h2>
            <p className="mt-2 text-sm text-slate-600">
              Vui lòng nhập thông tin để truy cập tài khoản của bạn
            </p>
          </div>
