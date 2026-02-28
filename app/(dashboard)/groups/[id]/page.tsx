"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Users, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Info,
  ChevronRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { GroupTransactionSchema } from "@/schemas";
import { getGroups } from "@/actions/groups";
import { 
  getGroupTransactions, 
  createGroupTransaction, 
  deleteGroupTransaction, 
  getGroupBalances 
} from "@/actions/group-transactions";
import { getCategories } from "@/actions/categories";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const form = useForm<z.infer<typeof GroupTransactionSchema>>({
    resolver: zodResolver(GroupTransactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: new Date(),
      categoryId: "",
      groupId: groupId,
      payerId: "",
      splits: [],
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupsData, transData, balancesData, catData] = await Promise.all([
        getGroups(),
        getGroupTransactions(groupId),
        getGroupBalances(groupId),
        getCategories()
      ]);
      
      const currentGroup = groupsData.find((g: any) => g.id === groupId);
      setGroup(currentGroup);
      setTransactions(transData);
      setBalances(balancesData);
      setCategories(catData.filter((c: any) => c.type === "EXPENSE"));
      
      if (currentGroup) {
        setSelectedMembers(currentGroup.members.map((m: any) => m.userId));
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu nhóm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const onSubmit = async (values: z.infer<typeof GroupTransactionSchema>) => {
    // Tự động tính toán split đều cho những người được chọn
    const splitAmount = values.amount / selectedMembers.length;
    const splits = selectedMembers.map(userId => ({
      userId,
      amount: splitAmount
    }));

    const result = await createGroupTransaction({
      ...values,
      splits
    });

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
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
      const result = await deleteGroupTransaction(id, groupId);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Không tìm thấy nhóm</h2>
        <Link href="/groups">
          <Button variant="link">Quay lại danh sách nhóm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/groups">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
          <p className="text-muted-foreground">{group.description}</p>
        </div>
        <div className="ml-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm chi tiêu nhóm
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Chi tiêu nhóm mới</DialogTitle>
                <DialogDescription>
                  Nhập khoản chi tiêu và chọn những người sẽ chia sẻ khoản chi này.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="payerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Người thanh toán</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ai đã trả tiền?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {group.members.map((member: any) => (
                              <SelectItem key={member.userId} value={member.userId}>
                                {member.user.name}
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Ăn tối, Tiền điện tháng 5..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Chia tiền cho ai?</FormLabel>
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-slate-50">
                      {group.members.map((member: any) => (
                        <div key={member.userId} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`member-${member.userId}`}
                            checked={selectedMembers.includes(member.userId)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMembers([...selectedMembers, member.userId]);
                              } else {
                                if (selectedMembers.length > 1) {
                                  setSelectedMembers(selectedMembers.filter(id => id !== member.userId));
                                } else {
                                  toast.error("Phải có ít nhất một người chia tiền");
                                }
                              }
                            }}
                          />
                          <label htmlFor={`member-${member.userId}`} className="text-sm font-medium leading-none cursor-pointer">
                            {member.user.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      * Số tiền sẽ được chia đều cho {selectedMembers.length} người đã chọn.
                    </p>
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="w-full">Lưu chi tiêu</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Lịch sử chi tiêu nhóm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Chưa có giao dịch nào trong nhóm này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{t.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{t.payer.name} đã trả</span>
                            <span>•</span>
                            <span>{format(new Date(t.date), "dd/MM/yyyy", { locale: vi })}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-[10px]">{t.category.name}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[10px] text-muted-foreground mr-1">Chia cho:</span>
                            {t.splits.map((s: any) => (
                              <Badge key={s.id} variant="secondary" className="text-[9px] px-1 py-0">
                                {s.user.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-destructive">-{formatCurrency(t.amount)}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Số dư thành viên
              </CardTitle>
              <CardDescription>
                Ai đang nợ ai bao nhiêu?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {balances.map((b) => (
                <div key={b.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={b.image || ""} />
                      <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-[10px] text-muted-foreground">{b.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${b.balance >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {b.balance >= 0 ? "+" : ""}{formatCurrency(b.balance)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {b.balance >= 0 ? "Được nhận lại" : "Phải trả thêm"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-slate-50 text-[11px] text-muted-foreground p-3 flex gap-2">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <p>Số dư dương (+) nghĩa là người đó đã trả nhiều hơn phần của mình. Số dư âm (-) nghĩa là người đó đang nợ nhóm.</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thông tin nhóm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã mời:</span>
                <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">{group.inviteCode}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo:</span>
                <span>{format(new Date(group.createdAt), "dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thành viên:</span>
                <span>{group.members.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
