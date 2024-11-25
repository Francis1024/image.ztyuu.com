"use client";

import { useState, useEffect, useRef } from "react";
import { UploadSection } from "@/components/upload-section";
import { EditPage } from "@/components/edit-page";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/client";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { removeBackground } from "@imgly/background-removal";
import { ImageList } from "@/components/image-list";
import { v4 as uuidv4 } from "uuid";

interface UploadSectionProps {
  onFileSelect: (file: File) => Promise<void>;
  isLoading: boolean;
}

interface ClassificationResult {
  label: string;
  score: number;
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
  const [images, setImages] = useState<
    Array<{
      id: string;
      originalUrl: string;
      processedUrl: string;
    }>
  >([]);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classificationResult, setClassificationResult] = useState<
    ClassificationResult[] | null
  >(null);
  const [classificationReady, setClassificationReady] = useState<
    boolean | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    setLoading(true);

    try {
      const processedImage = await removeBackground(file, {
        debug: true,
        model: "isnet_quint8",
        output: {
          format: "image/png",
          quality: 0.8,
        },
      });

      const processedUrl = URL.createObjectURL(processedImage);

      const imgElement = document.createElement("img");
      imgElement.onload = () => {
        setDimensions({
          width: imgElement.naturalWidth,
          height: imgElement.naturalHeight,
        });
      };
      imgElement.src = processedUrl;

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
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("toast.error.title"),
        description: t("toast.error.processingFailed"),
      });
    } finally {
      setLoading(false);
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

  const classify = async (text: string) => {
    if (!text) return;
    if (classificationReady === null) setClassificationReady(false);

    try {
      const response = await fetch(
        `/api/classify?text=${encodeURIComponent(text)}`
      );

      if (!classificationReady) setClassificationReady(true);

      if (!response.ok) {
        throw new Error("Classification request failed");
      }

      const json = await response.json();
      setClassificationResult(json);
    } catch (error) {
      console.error("Classification error:", error);
      setClassificationResult(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] flex flex-col">
      <div className="flex-1 flex flex-col">
        {currentImageId ? (
          <EditPage
            imageUrl={
              images.find((img) => img.id === currentImageId)?.processedUrl ||
              ""
            }
            originalUrl={
              images.find((img) => img.id === currentImageId)?.originalUrl || ""
            }
            onDownload={handleDownload}
            dimensions={{
              width: dimensions.width,
              height: dimensions.height,
            }}
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

        {/* Add classification section */}
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            {t("Text Classification")}
          </h2>
          <input
            type="text"
            className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
            placeholder={t("Enter text here")}
            onChange={(e) => {
              setErrorMessage(null);
              classify(e.target.value);
            }}
          />

          {classificationReady !== null && (
            <div className="bg-gray-100 p-2 rounded">
              {errorMessage ? (
                <p className="text-red-500">{errorMessage}</p>
              ) : !classificationReady || !classificationResult ? (
                <p>{t("Loading...")}</p>
              ) : (
                <pre>{JSON.stringify(classificationResult, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
