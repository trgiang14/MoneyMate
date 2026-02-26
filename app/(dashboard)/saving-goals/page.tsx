"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Target, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSavingGoals, createSavingGoal, deleteSavingGoal, updateSavingGoal } from "@/actions/saving-goals";
import { cn } from "@/lib/utils";

const SavingGoalSchema = z.object({
  name: z.string().min(1, "Tên mục tiêu không được để trống"),
  targetAmount: z.coerce.number().min(1, "Số tiền mục tiêu phải lớn hơn 0"),
  currentAmount: z.coerce.number().min(0, "Số tiền hiện có không được âm"),
  deadline: z.string().optional().nullable(),
});

export default function SavingGoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof SavingGoalSchema>>({
    resolver: zodResolver(SavingGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getSavingGoals();
      setGoals(data);
    } catch (error) {
      toast.error("Không thể tải danh sách mục tiêu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof SavingGoalSchema>) => {
    const formattedValues = {
      ...values,
      deadline: values.deadline ? new Date(values.deadline) : null,
    };
    const result = await createSavingGoal(formattedValues as any);
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
    if (confirm("Bạn có chắc chắn muốn xóa mục tiêu này?")) {
      const result = await deleteSavingGoal(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchData();
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mục tiêu tiết kiệm</h1>
          <p className="text-muted-foreground">
            Thiết lập và theo dõi tiến độ các khoản tiết kiệm của bạn
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Thêm mục tiêu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm mục tiêu mới</DialogTitle>
              <DialogDescription>
                Đặt mục tiêu cụ thể để tiết kiệm tiền cho tương lai.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên mục tiêu</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Mua laptop, Đi du lịch..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền mục tiêu (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ví dụ: 20000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền hiện có (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ví dụ: 5000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hạn chót (Không bắt buộc)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Lưu mục tiêu</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Đang tải...</p>
        ) : goals.length === 0 ? (
          <Card className="col-span-full py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Chưa có mục tiêu nào</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Hãy bắt đầu bằng cách thêm một mục tiêu tiết kiệm mới để theo dõi tiến độ của bạn.
              </p>
            </div>
          </Card>
        ) : (
          goals.map((goal) => {
            const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            return (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(goal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Mục tiêu: {formatCurrency(goal.targetAmount)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hiện có: {formatCurrency(goal.currentAmount)}</span>
                      <span className="font-medium text-primary">{percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Hạn chót: {format(new Date(goal.deadline), "dd/MM/yyyy", { locale: vi })}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="text-xs text-muted-foreground italic">
                    {goal.targetAmount - goal.currentAmount > 0 
                      ? `Bạn cần tiết kiệm thêm ${formatCurrency(goal.targetAmount - goal.currentAmount)}`
                      : "🎉 Chúc mừng! Bạn đã hoàn thành mục tiêu!"}
                  </div>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
