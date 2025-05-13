"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, TextSearch } from "lucide-react";
import { Octokit } from "octokit";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalStorage } from "react-use";

export type Repos = Awaited<
  ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>
>["data"];

const formSchema = z.object({
  token: z
    .string({ required_error: "请输入Github Token" })
    .min(1, "Token不能为空"),
  repo: z.string({ required_error: "请选择仓库" }),
});

export type Config = z.infer<typeof formSchema>;

const useConfigModal = (
  initialValue?: Config,
  {
    onSubmit,
  }: {
    onSubmit?: (data: z.infer<typeof formSchema>) => void;
  } = {}
) => {
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useLocalStorage<Repos>("repos", []);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValue ?? {},
  });

  const getRepos = async () => {
    const { token } = form.getValues();
    if (!token) {
      return toast.error("请填写Token");
    }
    const octokit = new Octokit({
      auth: token,
    });
    setLoading(true);
    octokit.rest.repos
      .listForAuthenticatedUser()
      .then((res) => setRepos(res.data))
      .finally(() => setLoading(false));
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit?.(data);
    closeModal();
  };

  useEffect(() => {
    form.reset();
  }, [JSON.stringify(initialValue)]);

  const element = (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(handleSubmit)();
            }}
            className="space-y-8"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>设置</AlertDialogTitle>
            </AlertDialogHeader>
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入Github Token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repo"
              render={({ field: { onChange, ...rest } }) => (
                <FormItem>
                  <FormLabel>
                    仓库
                    <RefreshCcw
                      className={cn(
                        "cursor-pointer size-3.5",
                        loading &&
                          "pointer-events-none cursor-not-allowed opacity-60 animate-spin"
                      )}
                      onClick={getRepos}
                    />
                  </FormLabel>
                  <FormControl>
                    <Select {...rest} onValueChange={onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择仓库" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {repos!.length === 0 ? (
                          <div className="w-full h-36 flex justify-center items-center flex-col gap-1">
                            <TextSearch className="size-18" />
                            <div className="text-xs">
                              <span>暂无仓库，</span>
                              <span
                                className={cn(
                                  "cursor-pointer",
                                  loading &&
                                    "pointer-events-none cursor-not-allowed opacity-60"
                                )}
                                onClick={getRepos}
                              >
                                刷新一下
                              </span>
                            </div>
                          </div>
                        ) : (
                          repos!.map((repo) => (
                            <SelectItem value={repo.name} key={repo.id}>
                              {repo.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <Button type="submit">保存</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return [element, openModal, closeModal] as const;
};

export default useConfigModal;
