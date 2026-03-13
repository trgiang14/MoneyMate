"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User, Lock, Coins } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Settings");
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
      toast.error(t("messages.error"));
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
      toast.error(t("messages.error"));
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
      toast.error(t("messages.error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> {t("tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <Coins className="h-4 w-4" /> {t("tabs.currency")}
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> {t("tabs.password")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>
                {t("profile.description")}
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
                        <FormLabel>{t("profile.name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("profile.namePlaceholder")} {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending}>
                    {isPending ? t("profile.saving") : t("profile.save")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("currency.title")}</CardTitle>
              <CardDescription>
                {t("currency.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t("currency.label")}
                </label>
                <Select
                  value={currency}
                  onValueChange={onCurrencyChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("currency.placeholder")} />
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
                  {t("currency.convertOld")}
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("currency.convertNote")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("password.title")}</CardTitle>
              <CardDescription>
                {t("password.description")}
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
                        <FormLabel>{t("password.current")}</FormLabel>
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
                        <FormLabel>{t("password.new")}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending}>
                    {isPending ? t("password.submitting") : t("password.submit")}
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

