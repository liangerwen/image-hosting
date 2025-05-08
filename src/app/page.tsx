"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  formatBytes,
} from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, SquareMousePointer, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useConfigModal, { Config } from "@/hooks/use-config-modal";
import { Octokit } from "octokit";

type ToArray<T> = T extends any[] ? T : T[];
type RepoFiles = ToArray<
  Awaited<ReturnType<Octokit["rest"]["repos"]["getContent"]>>["data"]
>;

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [processed, setProcessed] = useState<RepoFiles>([]);
  const [config, setConfig] = useState<Config>();
  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);

  const [element, openModal] = useConfigModal({
    onSubmit: (data) => {
      setConfig(data);
      getFiles(data);
    },
  });

  const getFiles = async (data: Config) => {
    const octokit = new Octokit({
      // auth: "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",
      auth: data.token,
    });
    const user = await octokit.rest.users.getAuthenticated();
    const content = await octokit.rest.repos.getContent({
      owner: user.data.login,
      repo: data.repo,
      path: "public/images",
    });
    const res = await octokit.rest.repos.listForAuthenticatedUser({
      visibility: "all",
    });
    console.log(res.data, "pxl");
    if (Array.isArray(content.data)) {
      setProcessed(content.data.filter((file) => file.type === "file"));
    }
  };

  return (
    <div className="w-full p-2 flex flex-col gap-2 size-full overflow-auto">
      <FileUpload
        className="w-full"
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        multiple
        accept="image/*"
      >
        <FileUploadDropzone
          className="cursor-pointer"
          onClick={(e) => {
            if (!config) {
              e.defaultPrevented = true;
              openModal();
            }
          }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            {config ? (
              <>
                <p className="font-medium text-sm">
                  点击、粘贴或拖动图片上传到图床
                </p>
                <p className="text-muted-foreground text-xs">
                  支持单次或批量上传，图片将转换为webp格式并进行压缩！
                </p>
              </>
            ) : (
              <p className="font-medium text-sm">请选择仓库</p>
            )}
          </div>
        </FileUploadDropzone>
        <div className="flex justify-between">
          <div className="flex gap-1 items-center">
            <Github className="size-5 text-primary" />
            {config ? (
              <Badge variant="outline">{config.repo}</Badge>
            ) : (
              <Badge
                variant="outline"
                className="cursor-pointer"
                onClick={() => openModal()}
              >
                请选择仓库
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button>上传</Button>
            <Button variant="outline" onClick={() => openModal()}>
              设置
            </Button>
          </div>
        </div>
        {config && (
          <Tabs defaultValue="waiting">
            <TabsList>
              <TabsTrigger value="waiting">待上传</TabsTrigger>
              <TabsTrigger value="processed">已上传</TabsTrigger>
            </TabsList>
            <TabsContent value="waiting">
              <FileUploadList>
                {files.map((file, index) => (
                  <FileUploadItem key={index} value={file}>
                    <FileUploadItemPreview
                      className="cursor-pointer"
                      onClick={() => window.open(URL.createObjectURL(file))}
                    />
                    <FileUploadItemMetadata />
                    <Badge>压缩成功({formatBytes(22993242)})，等待上传</Badge>
                    <FileUploadItemDelete asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <X />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </TabsContent>
            <TabsContent value="processed">
              {processed.length === 0 ? (
                <div>暂无上传记录</div>
              ) : (
                <div className="data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0 data-[state=inactive]:slide-out-to-top-2 data-[state=active]:slide-in-from-top-2 flex flex-col gap-2 data-[state=active]:animate-in data-[state=inactive]:animate-out">
                  {processed.map((file) => (
                    <div
                      className="relative flex items-center gap-2.5 rounded-md border p-3"
                      key={file.sha}
                    >
                      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50 [&>svg]:size-10">
                        <img
                          src={file.download_url!}
                          alt={file.name}
                          className="size-full object-cover"
                          onLoad={(event) => {
                            if (!(event.target instanceof HTMLImageElement))
                              return;
                            URL.revokeObjectURL(event.target.src);
                          }}
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium text-sm">
                          {file.name}
                        </span>
                        <span className="truncate text-muted-foreground text-xs">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                      <Button
                        variant="link"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(file.download_url!)
                            .then(() => toast.success("链接已复制到剪贴板"))
                            .catch(() => toast.error("复制失败，请手动复制"))
                        }
                      >
                        复制链接
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </FileUpload>
      {element}
      {!config && (
        <div className="flex-1 flex flex-col gap-1 justify-center items-center text-center text-muted-foreground text-sm">
          <SquareMousePointer size={96} />
          <Button variant="link" onClick={openModal} className="text-lg">
            请选择仓库
          </Button>
        </div>
      )}
    </div>
  );
}
