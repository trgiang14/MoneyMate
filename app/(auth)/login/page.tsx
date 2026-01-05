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
import { AuthFeatures } from "@/components/shared/auth-features";

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

        <AuthFeatures type="login" />
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

          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-700">Mật khẩu</FormLabel>
                          <Link href="#" className="text-xs text-primary hover:underline font-medium">
                            Quên mật khẩu?
                          </Link>
                        </div>
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
                        Đang xử lý...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Đăng nhập <ArrowRight className="h-5 w-5" />
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
                Chưa có tài khoản?{" "}
                <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          <p className="text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} MoneyMate. Bảo mật và riêng tư tuyệt đối.
          </p>
        </div>
      </div>
    </div>
  );
}
