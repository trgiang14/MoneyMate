"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Plus, Trash2, Wallet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getBudgets, upsertBudget, deleteBudget } from "@/actions/budgets";
import { getCategories } from "@/actions/categories";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

export default function BudgetsPage() {
  const t = useTranslations("Budgets");
  const locale = useLocale();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const BudgetSchema = z.object({
    amount: z.coerce.number().min(1, t("errors.amountMin")),
    month: z.number().min(1).max(12),
    year: z.number(),
    categoryId: z.string().min(1, t("errors.categoryRequired")),
  });

  const form = useForm<z.infer<typeof BudgetSchema>>({
    resolver: zodResolver(BudgetSchema),
    defaultValues: {
      amount: 0,
      month,
      year,
      categoryId: "",
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [budgetsData, categoriesData] = await Promise.all([
        getBudgets(month, year),
        getCategories(),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData.filter((c: any) => c.type === "EXPENSE"));
    } catch (error) {
      toast.error(t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const onSubmit = async (values: z.infer<typeof BudgetSchema>) => {
    const result = await upsertBudget(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsDialogOpen(false);
      form.reset({
        amount: 0,
        month,
        year,
        categoryId: "",
      });
      fetchData();
    }
  };

  const onDelete = async (id: string) => {
    if (confirm(t("deleteConfirm"))) {
      const result = await deleteBudget(id);
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

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-destructive";
    if (percent >= 80) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description", { month, year })}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("setupBudget")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("setupBudget")}</DialogTitle>
              <DialogDescription>
                {t("setupDescription")}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("category")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("categoryPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("amount")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t("amountPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{t("save")}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>{t("loading")}</p>
        ) : budgets.length === 0 ? (
          <Card className="col-span-full py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t("noBudgets")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {t("noBudgetsDesc")}
              </p>
            </div>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id} className={cn(
              "relative overflow-hidden",
              budget.percent >= 100 && "border-destructive/50"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(budget.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardDescription>
                  {t("limit", { amount: formatCurrency(budget.amount) })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("spent", { amount: formatCurrency(budget.spent) })}</span>
                    <span className={cn(
                      "font-medium",
                      budget.percent >= 100 ? "text-destructive" : 
                      budget.percent >= 80 ? "text-yellow-600" : "text-emerald-600"
                    )}>
                      {budget.percent}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", getProgressColor(budget.percent))}
                      style={{ width: `${budget.percent}%` }}
                    />
                  </div>
                </div>
                
                {budget.percent >= 100 ? (
                  <div className="flex items-center gap-2 text-xs text-destructive font-medium bg-destructive/10 p-2 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    {t("overBudget")}
                  </div>
                ) : budget.percent >= 80 ? (
                  <div className="flex items-center gap-2 text-xs text-yellow-600 font-medium bg-yellow-50 p-2 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    {t("nearLimit")}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {t("remaining", { amount: formatCurrency(budget.remaining) })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
