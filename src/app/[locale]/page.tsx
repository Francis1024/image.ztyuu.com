"use client";

import { useState, useEffect } from "react";
import { UploadSection } from "@/components/upload-section";
import { EditPage } from "@/components/edit-page";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/client";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { removeBackground } from "@imgly/background-removal";

interface UploadSectionProps {
  onFileSelect: (file: File) => Promise<void>;
  isLoading: boolean;
}

export default function RemoveBackground() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const t = useI18n();
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 检查语言设置
  useEffect(() => {
    const savedLocale = Cookies.get("NEXT_LOCALE");
    const currentPath = window.location.pathname;
    const currentLocale = currentPath.split("/")[1]; // 获取当前URL中的语言代码

    // 如果有保存的语言设置且与当前URL的语言不同，则重定向
    if (savedLocale && savedLocale !== currentLocale) {
      const newPath = currentPath.replace(
        `/${currentLocale}`,
        `/${savedLocale}`
      );
      router.push(newPath);
    }
  }, [router]);

  const handleFileSelect = async (file: File) => {
    const img = document.createElement("img");
    img.onload = () => {
      setDimensions({
        width: img.width,
        height: img.height,
      });
    };
    img.src = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setLoading(true);

    try {
      console.log("Starting background removal...");
      const processedImage = await removeBackground(file, {
        debug: true,
        model: "isnet_quint8",
        output: {
          format: "image/png",
          quality: 0.8,
        },
        progress: (key: string, current: number, total: number) => {
          console.log(`Processing progress - ${key}: ${current}/${total}`);
        },
      });

      console.log("Background removal completed");
      setResultUrl(URL.createObjectURL(processedImage));
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: t("toast.error.title"),
        description: t("toast.error.processingFailed"),
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quality: "normal" | "hd") => {
    if (resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      // 根据质量选择不同的文件名
      const filename =
        quality === "hd"
          ? "removed-background-hd.png"
          : "removed-background.png";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // 如果有处理结果，显示编辑页面
  if (resultUrl && previewUrl) {
    return (
      <EditPage
        imageUrl={resultUrl}
        originalUrl={previewUrl}
        onDownload={() => handleDownload("normal")}
        dimensions={dimensions}
      />
    );
  }

  return (
    <main className="h-[calc(100vh-var(--header-height))] bg-background overflow-y-auto">
      {!loading && (
        <UploadSection onFileSelect={handleFileSelect} isLoading={loading} />
      )}

      {/* 处理中的预览区域 */}
      {loading && (
        <div className="max-w-6xl mx-auto mt-16 px-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {t("upload.preview.title")}
            </h3>
          </div>
          <div className="relative aspect-video">
            <Image
              src={previewUrl!}
              alt="Preview"
              fill
              className="object-contain rounded-lg opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner text={t("upload.preview.loadingText")} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
