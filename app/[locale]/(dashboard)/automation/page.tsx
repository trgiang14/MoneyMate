"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Clock, Bell, Repeat as RepeatIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations, useLocale } from "next-intl";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RecurringTransactionSchema, ReminderSchema, BillSchema } from "@/schemas";
import { 
  getRecurringTransactions, 
  createRecurringTransaction, 
  deleteRecurringTransaction, 
  toggleRecurringTransaction,
  processRecurringTransactions
} from "@/actions/recurring-transactions";
import { 
  getReminders, 
  createReminder, 
  deleteReminder, 
  toggleReminder 
} from "@/actions/reminders";
import {
  getBills,
  createBill,
  deleteBill,
  toggleBill
} from "@/actions/bills";
import { getCategories } from "@/actions/categories";

export default function AutomationPage() {
  const t = useTranslations("Automation");
  const tCat = useTranslations("Categories");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  const DAYS_OF_WEEK = [
    { id: 1, label: t("reminder.days.1") },
    { id: 2, label: t("reminder.days.2") },
    { id: 3, label: t("reminder.days.3") },
    { id: 4, label: t("reminder.days.4") },
    { id: 5, label: t("reminder.days.5") },
    { id: 6, label: t("reminder.days.6") },
    { id: 0, label: t("reminder.days.0") },
  ];

  const [activeTab, setActiveTab] = useState("recurring");
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recurringForm = useForm<z.infer<typeof RecurringTransactionSchema>>({
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

  const reminderForm = useForm<z.infer<typeof ReminderSchema>>({
    resolver: zodResolver(ReminderSchema),
    defaultValues: {
      title: "",
      description: "",
      time: "20:00",
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      isActive: true,
    },
  });

  const billForm = useForm<z.infer<typeof BillSchema>>({
    resolver: zodResolver(BillSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: 1,
      description: "",
      categoryId: "",
      isActive: true,
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recurringData, reminderData, billData, catData] = await Promise.all([
        getRecurringTransactions(),
        getReminders(),
        getBills(),
        getCategories()
      ]);
      setRecurringTransactions(recurringData);
      setReminders(reminderData);
      setBills(billData);
      setCategories(catData);
    } catch (error) {
      toast.error(t("fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRecurringSubmit = async (values: z.infer<typeof RecurringTransactionSchema>) => {
    const result = await createRecurringTransaction(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsRecurringDialogOpen(false);
      recurringForm.reset();
      fetchData();
    }
  };

  const onReminderSubmit = async (values: z.infer<typeof ReminderSchema>) => {
    const result = await createReminder(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsReminderDialogOpen(false);
      reminderForm.reset();
      fetchData();
    }
  };

  const onBillSubmit = async (values: z.infer<typeof BillSchema>) => {
    const result = await createBill(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsBillDialogOpen(false);
      billForm.reset();
      fetchData();
    }
  };

  const onDeleteRecurring = async (id: string) => {
    if (confirm(t("recurring.deleteConfirm"))) {
      const result = await deleteRecurringTransaction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchData();
      }
    }
  };

  const onDeleteReminder = async (id: string) => {
    if (confirm(t("reminder.deleteConfirm"))) {
      const result = await deleteReminder(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchData();
      }
    }
  };

  const onDeleteBill = async (id: string) => {
    if (confirm(t("bill.deleteConfirm"))) {
      const result = await deleteBill(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchData();
      }
    }
  };

  const onToggleRecurring = async (id: string, currentStatus: boolean) => {
    const result = await toggleRecurringTransaction(id, !currentStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchData();
    }
  };

  const onToggleReminder = async (id: string, currentStatus: boolean) => {
    const result = await toggleReminder(id, !currentStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      fetchData();
    }
  };

  const onToggleBill = async (id: string, currentStatus: boolean) => {
    const result = await toggleBill(id, !currentStatus);
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
      toast.success(t("automationSuccess", { count: result.created }));
      fetchData();
    } catch (error) {
      toast.error(t("automationError"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunAutomation} 
            disabled={isProcessing}
          >
            <Clock className="mr-2 h-4 w-4" />
            {isProcessing ? t("processing") : t("runAutomation")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recurring" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <RepeatIcon className="h-4 w-4" />
            {t("tabs.recurring")}
          </TabsTrigger>
          <TabsTrigger value="bill" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t("tabs.bill")}
          </TabsTrigger>
          <TabsTrigger value="reminder" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t("tabs.reminder")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recurring" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t("recurring.title")}</h3>
            <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("recurring.add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("recurring.dialogTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("recurring.dialogDescription")}
                  </DialogDescription>
                </DialogHeader>
                <Form {...recurringForm}>
                  <form onSubmit={recurringForm.handleSubmit(onRecurringSubmit)} className="space-y-4">
                    <FormField
                      control={recurringForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("recurring.type")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("recurring.type")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INCOME">{t("recurring.income")}</SelectItem>
                              <SelectItem value="EXPENSE">{t("recurring.expense")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recurringForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("recurring.amount")}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recurringForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("recurring.category")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("recurring.categoryPlaceholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories
                                .filter(c => c.type === recurringForm.watch("type"))
                                .map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {tCat(`default.${category.name}`, { defaultValue: category.name })}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recurringForm.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("recurring.frequency")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("recurring.frequency")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DAILY">{t("recurring.frequencies.DAILY")}</SelectItem>
                              <SelectItem value="WEEKLY">{t("recurring.frequencies.WEEKLY")}</SelectItem>
                              <SelectItem value="MONTHLY">{t("recurring.frequencies.MONTHLY")}</SelectItem>
                              <SelectItem value="YEARLY">{t("recurring.frequencies.YEARLY")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recurringForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("recurring.startDate")}</FormLabel>
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
                      control={recurringForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("recurring.description")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("recurring.descriptionPlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full">{t("recurring.save")}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p>{t("recurring.noData")}</p>
            ) : recurringTransactions.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <Calendar className="h-12 w-12 mb-4 opacity-20" />
                <p>{t("recurring.noData")}</p>
              </div>
            ) : (
              recurringTransactions.map((item) => (
                <Card key={item.id} className={item.isActive ? "" : "opacity-60"}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={item.type === "INCOME" ? "success" : "destructive"}>
                        {item.type === "INCOME" ? t("recurring.income") : t("recurring.expense")}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={item.isActive} 
                          onCheckedChange={() => onToggleRecurring(item.id, item.isActive)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => onDeleteRecurring(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">
                      {item.amount.toLocaleString('vi-VN')} ₫
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {tCat(`default.${item.category?.name}`, { defaultValue: item.category?.name })} • {t(`recurring.frequencies.${item.frequency}`)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{item.description}</p>
                      <div className="flex items-center text-muted-foreground gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{t("recurring.nextRun", { date: format(new Date(item.nextRunDate), "dd/MM/yyyy") })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="bill" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t("bill.title")}</h3>
            <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("bill.add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("bill.dialogTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("bill.dialogDescription")}
                  </DialogDescription>
                </DialogHeader>
                <Form {...billForm}>
                  <form onSubmit={billForm.handleSubmit(onBillSubmit)} className="space-y-4">
                    <FormField
                      control={billForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bill.name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("bill.namePlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={billForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bill.amount")}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={billForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bill.dueDate")}</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="31" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={billForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bill.category")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("recurring.categoryPlaceholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories
                                .filter(c => c.type === "EXPENSE")
                                .map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {tCat(`default.${category.name}`, { defaultValue: category.name })}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={billForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bill.description")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("bill.descriptionPlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full">{t("bill.save")}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p>{t("bill.noData")}</p>
            ) : bills.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <CreditCard className="h-12 w-12 mb-4 opacity-20" />
                <p>{t("bill.noData")}</p>
              </div>
            ) : (
              bills.map((item) => (
                <Card key={item.id} className={item.isActive ? "" : "opacity-60"}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{t("bill.dueOn", { day: item.dueDate })}</Badge>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={item.isActive} 
                          onCheckedChange={() => onToggleBill(item.id, item.isActive)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => onDeleteBill(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">
                      {item.amount.toLocaleString('vi-VN')} ₫
                    </CardTitle>
                    <CardDescription>
                      {item.name} • {tCat(`default.${item.category?.name}`, { defaultValue: item.category?.name })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="text-muted-foreground">{item.description || t("bill.noDescription")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reminder" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t("reminder.title")}</h3>
            <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("reminder.add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("reminder.dialogTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("reminder.dialogDescription")}
                  </DialogDescription>
                </DialogHeader>
                <Form {...reminderForm}>
                  <form onSubmit={reminderForm.handleSubmit(onReminderSubmit)} className="space-y-4">
                    <FormField
                      control={reminderForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reminder.name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("reminder.namePlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reminderForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reminder.time")}</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reminderForm.control}
                      name="daysOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reminder.repeat")}</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`day-${day.id}`}
                                  checked={field.value.includes(day.id)}
                                  onCheckedChange={(checked) => {
                                    const current = [...field.value];
                                    if (checked) {
                                      field.onChange([...current, day.id]);
                                    } else {
                                      field.onChange(current.filter((v) => v !== day.id));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`day-${day.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {day.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reminderForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("reminder.description")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("reminder.descriptionPlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full">{t("reminder.save")}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p>{t("reminder.noData")}</p>
            ) : reminders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-20" />
                <p>{t("reminder.noData")}</p>
              </div>
            ) : (
              reminders.map((item) => (
                <Card key={item.id} className={item.isActive ? "" : "opacity-60"}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{item.time}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={item.isActive} 
                          onCheckedChange={() => onToggleReminder(item.id, item.isActive)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => onDeleteReminder(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="font-bold">{item.title}</p>
                      {item.description && <p className="text-muted-foreground">{item.description}</p>}
                      <div className="flex flex-wrap gap-1">
                        {item.daysOfWeek.split(",").map((dayIdx: string) => (
                          <Badge key={dayIdx} variant="outline" className="text-[10px]">
                            {DAYS_OF_WEEK.find(d => d.id === parseInt(dayIdx))?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
