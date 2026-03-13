"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Plus, Users, UserPlus, Trash2, LogOut, ChevronRight, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

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
import { Badge } from "@/components/ui/badge";
import { GroupSchema } from "@/schemas";
import { getGroups, createGroup, joinGroup, leaveGroup, deleteGroup } from "@/actions/groups";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GroupsPage() {
  const t = useTranslations("Groups");
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const createForm = useForm<z.infer<typeof GroupSchema>>({
    resolver: zodResolver(GroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      toast.error(t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onCreateSubmit = async (values: z.infer<typeof GroupSchema>) => {
    const result = await createGroup(values);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchData();
    }
  };

  const onJoinSubmit = async () => {
    if (!inviteCode) {
      toast.error(t("errors.inviteCodeRequired"));
      return;
    }
    const result = await joinGroup(inviteCode);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setIsJoinDialogOpen(false);
      setInviteCode("");
      fetchData();
    }
  };

  const onLeave = async (groupId: string) => {
    if (confirm(t("leaveConfirm"))) {
      const result = await leaveGroup(groupId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchData();
      }
    }
  };

  const onDelete = async (groupId: string) => {
    if (confirm(t("deleteConfirm"))) {
      const result = await deleteGroup(groupId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        fetchData();
      }
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t("copySuccess"));
    setTimeout(() => setCopiedCode(null), 2000);
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
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                {t("joinGroup")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t("joinGroup")}</DialogTitle>
                <DialogDescription>
                  {t("joinDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t("inviteCode")}
                  </label>
                  <Input 
                    placeholder={t("inviteCodePlaceholder")} 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={onJoinSubmit} className="w-full">{t("join")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("createGroup")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t("createGroup")}</DialogTitle>
                <DialogDescription>
                  {t("createDescription")}
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("groupName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("groupNamePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("groupDescription")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("groupDescriptionPlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="w-full">{t("create")}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>{t("list.loading")}</p>
        ) : groups.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground bg-white">
            <Users className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">{t("noGroups")}</p>
            <p className="text-sm">{t("noGroupsDesc")}</p>
          </div>
        ) : (
          groups.map((group) => (
            <Card key={group.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <CardDescription className="mt-1">{group.description || t("noDescription")}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {t("membersCount", { count: group.members.length })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex -space-x-2 overflow-hidden mb-4">
                  {group.members.slice(0, 5).map((member: any) => (
                    <Avatar key={member.id} className="inline-block border-2 border-background w-8 h-8">
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback className="text-[10px]">{member.user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  ))}
                  {group.members.length > 5 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-[10px] font-medium border-2 border-background">
                      +{group.members.length - 5}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("inviteCode")}:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{group.inviteCode}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => copyToClipboard(group.inviteCode)}
                      >
                        {copiedCode === group.inviteCode ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("transactionsCount")}</span>
                    <span className="font-medium">{group._count.transactions}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-slate-50/50 flex gap-2">
                <Link href={`/groups/${group.id}`} className="flex-1">
                  <Button variant="default" size="sm" className="w-full">
                    {t("details")}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-red-50"
                  onClick={() => onLeave(group.id)}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                {group.members.some((m: any) => m.role === 'ADMIN') && (
                   <Button 
                   variant="ghost" 
                   size="sm" 
                   className="text-destructive hover:bg-red-50"
                   onClick={() => onDelete(group.id)}
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
