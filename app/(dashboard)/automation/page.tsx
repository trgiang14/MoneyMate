"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Play, Pause, Calendar, Clock, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RecurringTransactionSchema } from "@/schemas";
import { 
  getRecurringTransactions, 
  createRecurringTransaction, 
  deleteRecurringTransaction, 
  toggleRecurringTransaction,
  processRecurringTransactions
} from "@/actions/recurring-transactions";
import { getCategories } from "@/actions/categories";

export default function AutomationPage() {
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof RecurringTransactionSchema>>({
    resolver: zodResolver(RecurringTransactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      type: "EXPENSE",
      frequency: "MONTHLY",
      startDate: new Date(),
      categoryId: "",
      isActive: true,
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recurringData, catData] = await Promise.all([
        getRecurringTransactions(),
        getCategories()
      ]);
      setRecurringTransactions(recurringData);
      setCategories(catData);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof RecurringTransactionSchema>) => {
    const result = await createRecurringTransaction(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    }
  };

  const onDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khoản định kỳ này?")) {
      const result = await deleteRecurringTransaction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchData();
      }
    }
  };

  const onToggle = async (id: string, currentStatus: boolean) => {
    const result = await toggleRecurringTransaction(id, !currentStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchData();
    }
  };

  const handleRunAutomation = async () => {
    setIsProcessing(true);
    try {
      const result = await processRecurringTransactions();
      toast.success(`Đã xử lý xong! Tạo mới ${result.created} giao dịch.`);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi chạy tự động hóa");
    } finally {
      setIsProcessing(false);
    }
  };

  const frequencyLabels: Record<string, string> = {
    DAILY: "Hàng ngày",
    WEEKLY: "Hàng tuần",
    MONTHLY: "Hàng tháng",
    YEARLY: "Hàng năm",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tự động hóa</h2>
          <p className="text-muted-foreground">
            Quản lý các khoản thu chi định kỳ của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunAutomation} 
            disabled={isProcessing}
          >
            <Clock className="mr-2 h-4 w-4" />
            {isProcessing ? "Đang xử lý..." : "Chạy ngay"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm định kỳ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm khoản định kỳ</DialogTitle>
                <DialogDescription>
                  Tạo một lịch trình thu hoặc chi tự động.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INCOME">Thu nhập</SelectItem>
                            <SelectItem value="EXPENSE">Chi phí</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories
                              .filter(c => c.type === form.watch("type"))
                              .map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tần suất</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tần suất" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DAILY">Hàng ngày</SelectItem>
                            <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                            <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                            <SelectItem value="YEARLY">Hàng năm</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Tiền nhà hàng tháng" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full">Lưu</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Đang tải...</p>
        ) : recurringTransactions.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 opacity-20" />
            <p>Chưa có khoản thu chi định kỳ nào.</p>
          </div>
        ) : (
          recurringTransactions.map((item) => (
            <Card key={item.id} className={item.isActive ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={item.type === "INCOME" ? "success" : "destructive"}>
                    {item.type === "INCOME" ? "Thu nhập" : "Chi phí"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={item.isActive} 
                      onCheckedChange={() => onToggle(item.id, item.isActive)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">
                  {item.amount.toLocaleString('vi-VN')} ₫
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  {item.category?.name} • {frequencyLabels[item.frequency]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{item.description}</p>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Tiếp theo: {format(new Date(item.nextRunDate), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
