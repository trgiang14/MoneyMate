"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User, Lock, Coins } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateProfile, updatePassword, updateCurrency, getUserCurrency } from "@/actions/settings";
import { ProfileSchema, PasswordSchema } from "@/schemas";
import { CURRENCIES } from "@/lib/currencies";

export default function SettingsPage() {
  const [isPending, setIsPending] = useState(false);
  const [currency, setCurrency] = useState("VND");
  const [convertOld, setConvertOld] = useState(false);

  useEffect(() => {
    const fetchCurrency = async () => {
      const userCurrency = await getUserCurrency();
      setCurrency(userCurrency);
    };
    fetchCurrency();
  }, []);

  const profileForm = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onProfileSubmit = async (values: z.infer<typeof ProfileSchema>) => {
    setIsPending(true);
    try {
      const result = await updateProfile(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    } finally {
      setIsPending(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof PasswordSchema>) => {
    setIsPending(true);
    try {
      const result = await updatePassword(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        passwordForm.reset();
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    } finally {
      setIsPending(false);
    }
  };

  const onCurrencyChange = async (value: string) => {
    setIsPending(true);
    try {
      const result = await updateCurrency(value, convertOld);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCurrency(value);
        toast.success(result.success);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý tài khoản và cấu hình ứng dụng của bạn
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Hồ sơ
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <Coins className="h-4 w-4" /> Tiền tệ
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Bảo mật
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật tên hiển thị của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Tên của bạn" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Đơn vị tiền tệ</CardTitle>
              <CardDescription>
                Chọn đơn vị tiền tệ chính để hiển thị trên toàn ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Đơn vị tiền tệ
                </label>
                <Select
                  value={currency}
                  onValueChange={onCurrencyChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="convertOld" 
                  checked={convertOld} 
                  onCheckedChange={(checked) => setConvertOld(!!checked)}
                  disabled={isPending}
                />
                <label
                  htmlFor="convertOld"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Tự động quy đổi các giao dịch và ngân sách cũ theo tỷ giá hiện tại
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                * Lưu ý: Nếu chọn quy đổi, tất cả số tiền trong lịch sử giao dịch và ngân sách sẽ được nhân với tỷ giá hối đoái hiện tại.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Đảm bảo mật khẩu của bạn đủ mạnh để bảo vệ tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu hiện tại</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

