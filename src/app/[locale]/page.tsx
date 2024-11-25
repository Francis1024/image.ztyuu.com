"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UploadSection } from "@/components/upload-section";
import { EditPage } from "@/components/edit-page";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { removeBackground } from "@imgly/background-removal";
import { ImageList } from "@/components/image-list";
import { v4 as uuidv4 } from "uuid";
import { Header } from "@/components/header";

interface WorkerMessage {
  status:
    | "initiate"
    | "loading"
    | "ready"
    | "processing"
    | "complete"
    | "error";
  message?: string;
  mask?: ImageData;
  url: string;
  id: string;
  error?: string;
}

type ProcessingMode = "classic" | "ai";

export default function RemoveBackground() {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const t = useI18n();
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [images, setImages] = useState<
    Array<{
      id: string;
      originalUrl: string;
      processedUrl: string;
    }>
  >([]);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingMode, setProcessingMode] =
    useState<ProcessingMode>("classic");
  const [modelReady, setModelReady] = useState(false);
  const worker = useRef<Worker | null>(null);

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

  // Initialize worker and model loading
  useEffect(() => {
    if (!worker.current) {
      console.log("初始化 Worker...");
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
    }

    const onMessageReceived = (e: MessageEvent<WorkerMessage>) => {
      console.log("收到 Worker 消息:", e.data);
      const { status, message } = e.data;

      switch (status) {
        case "initiate":
          setModelReady(false);
          break;

        case "loading":
          setModelReady(false);
          break;

        case "ready":
          console.log("Model loading complete");
          setModelReady(true);
          toast({
            title: t("toast.success.title"),
            description: t("toast.success.modelLoaded"),
          });
          break;

        case "processing":
          setLoading(true);
          break;

        case "complete":
          handleAIProcessingComplete(e.data);
          break;

        case "error":
          console.error("Processing error:", e.data.error);
          toast({
            variant: "destructive",
            title: t("toast.error.title"),
            description: message || t("toast.error.processingFailed"),
          });
          setLoading(false);
          break;
      }
    };

    worker.current.addEventListener("message", onMessageReceived);

    return () => {
      console.log("清理 Worker...");
      worker.current?.removeEventListener("message", onMessageReceived);
    };
  }, []);

  const handleImageSelect = (id: string) => {
    setCurrentImageId(id);
    const currentImage = images.find((img) => img.id === id);
    if (currentImage) {
      setResultUrl(currentImage.processedUrl);

      // 同样使用 HTMLImageElement
      const imgElement = document.createElement("img");
      imgElement.onload = () => {
        setDimensions({
          width: imgElement.naturalWidth,
          height: imgElement.naturalHeight,
        });
      };
      imgElement.src = currentImage.processedUrl;
    }
  };

  const handleFileSelect = async (file: File) => {
    const id = uuidv4();
    const originalUrl = URL.createObjectURL(file);

    try {
      setLoading(true);
      if (processingMode === "classic") {
        // 经典模式处理
        const processedImage = await removeBackground(file, {
          debug: true,
          model: "isnet_quint8",
          output: {
            format: "image/png",
            quality: 0.8,
          },
        });
        handleProcessedImage(id, originalUrl, processedImage);
      } else {
        if (worker.current && modelReady) {
          worker.current.postMessage({
            url: originalUrl,
            id: id,
          });
        } else {
          throw new Error(t("error.modelNotReady"));
        }
      }
    } catch (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: t("toast.error.title"),
        description: t("toast.error.processingFailed"),
      });
    }
  };

  const handleProcessedImage = (
    id: string,
    originalUrl: string,
    processedImage: Blob
  ) => {
    const processedUrl = URL.createObjectURL(processedImage);
    const imgElement = document.createElement("img");
    imgElement.onload = () => {
      setDimensions({
        width: imgElement.naturalWidth,
        height: imgElement.naturalHeight,
      });
    };
    imgElement.src = processedUrl;
    setLoading(false);
    setImages((prev) => [
      ...prev,
      {
        id,
        originalUrl,
        processedUrl,
      },
    ]);
    setCurrentImageId(id);
    setResultUrl(processedUrl);
  };

  const handleAIProcessingComplete = async (data: WorkerMessage) => {
    try {
      console.log("处理完成，开始生成结果图片");
      const { mask, url, id } = data;

      // 使用传入的 URL 创建图片
      const image = document.createElement("img");
      image.src = url || "";

      await new Promise((resolve) => {
        image.onload = () => {
          console.log("原始图片尺寸:", image.width, "x", image.height);

          // 创建 canvas 处理图片
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            console.error("无法获取 canvas context");
            throw new Error("无法获取 canvas context");
          }

          // 绘制原始图片
          console.log("绘制原始图片");
          ctx.drawImage(image, 0, 0);

          // 更新 alpha 通道
          console.log("更新 alpha 通道");
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (mask && mask.data) {
            for (let i = 0; i < mask.data.length; ++i) {
              imageData.data[4 * i + 3] = mask.data[i];
            }
          } else {
            console.error("Mask is undefined or has no data");
          }
          ctx.putImageData(imageData, 0, 0);

          // 转换为 Blob
          console.log("生成最终图片");
          canvas.toBlob((blob) => {
            if (blob) {
              handleProcessedImage(id, url, blob);
            }
          }, "image/png");

          resolve(null);
        };
      });
    } catch (error) {
      console.error("AI 处理完成处理错误:", error);
      toast({
        variant: "destructive",
        title: t("toast.error.title"),
        description: t("toast.error.processingFailed"),
      });
    }
  };

  const handleImageDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (currentImageId === id) {
      const remaining = images.filter((img) => img.id !== id);
      setCurrentImageId(remaining.length > 0 ? remaining[0].id : null);
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

  const renderContent = () => (
    <div className="flex-1 flex flex-col">
      {currentImageId ? (
        <EditPage
          imageUrl={
            images.find((img) => img.id === currentImageId)?.processedUrl || ""
          }
          originalUrl={
            images.find((img) => img.id === currentImageId)?.originalUrl || ""
          }
          onDownload={handleDownload}
          dimensions={dimensions}
        >
          <ImageList
            images={images}
            currentImageId={currentImageId}
            onAddClick={() => fileInputRef.current?.click()}
            onImageSelect={handleImageSelect}
            onImageDelete={handleImageDelete}
          />
        </EditPage>
      ) : (
        <UploadSection onFileSelect={handleFileSelect} isLoading={loading} />
      )}
    </div>
  );

  return (
    <>
      <Header onModeChange={setProcessingMode} />
      <div className="min-h-[calc(100vh-var(--header-height))] flex flex-col p-6">
        <Tabs
          defaultValue="classic"
          className="w-full  mx-auto"
          onValueChange={(value) => setProcessingMode(value as ProcessingMode)}
        >
          <Card>
            <CardContent className="p-6">
              <TabsContent value="classic">{renderContent()}</TabsContent>
              <TabsContent value="ai">{renderContent()}</TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {/* Loading 遮罩 */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-medium text-gray-700">
                  {t("loading.removingBackground")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Section */}
        <footer className="text-center p-4 mt-auto">
          <a
            href="https://www.briaai.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by Briaai&apos;s RMBG-1.4 Model
          </a>
        </footer>
      </div>
    </>
  );
}
