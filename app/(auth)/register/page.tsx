"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wallet, ArrowRight, CheckCircle2, UserPlus } from "lucide-react";

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
import { RegisterSchema } from "@/schemas";
import { register } from "@/actions/register";
import { cn } from "@/lib/utils";
import { AuthFeatures } from "@/components/shared/auth-features";

export default function RegisterPage() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setIsPending(true);
    
    try {
      const data = await register(values);
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.success);
        router.push("/login");
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Illustration */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary" />
        
        {/* Animated Background Decoration */}
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" className="text-primary" />
          </svg>
        </div>

        <AuthFeatures type="register" />
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center lg:items-end lg:text-right">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <span className="text-2xl font-bold text-primary tracking-tight">MoneyMate</span>
              <Wallet className="h-10 w-10 text-primary" />
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tạo tài khoản mới</h2>
            <p className="mt-2 text-sm text-slate-600">
              Hoàn toàn miễn phí và bảo mật tuyệt đối
            </p>
          </div>

          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Họ và tên</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Nguyễn Văn A" 
                            disabled={isPending}
                            className="bg-white/50 border-slate-200 focus:bg-white transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="abc@example.com" 
                            type="email" 
                            disabled={isPending}
                            className="bg-white/50 border-slate-200 focus:bg-white transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Mật khẩu</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="******" 
                            type="password" 
                            disabled={isPending}
                            className="bg-white/50 border-slate-200 focus:bg-white transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20" disabled={isPending}>
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang tạo tài khoản...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Đăng ký ngay <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pb-8">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500 font-medium">Hoặc</span>
                </div>
              </div>
              <p className="text-center text-sm text-slate-600">
                Đã có tài khoản?{" "}
                <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Đăng nhập
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          <p className="text-center text-xs text-slate-400">
            Bằng việc đăng ký, bạn đồng ý với Điều khoản và Chính sách bảo mật của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
