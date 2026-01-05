"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CategorySchema, createCategory, deleteCategory, getCategories } from "@/actions/categories";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
    },
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (values: z.infer<typeof CategorySchema>) => {
    const result = await createCategory(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsDialogOpen(false);
      form.reset();
      fetchCategories();
    }
  };

  const onDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const result = await deleteCategory(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchCategories();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý các loại thu nhập và chi tiêu của bạn
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
              <DialogDescription>
                Tạo một danh mục mới để phân loại các giao dịch của bạn.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên danh mục</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Ăn uống, Tiền lương..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXPENSE">Khoản chi</SelectItem>
                          <SelectItem value="INCOME">Khoản thu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Lưu lại</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Đang tải...</p>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color || '#94a3b8' }}
                    />
                    {category.name}
                  </div>
                </CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={category.type === "INCOME" ? "success" : "destructive"}>
                    {category.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

