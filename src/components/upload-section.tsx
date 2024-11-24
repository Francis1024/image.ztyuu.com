"use client";
import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";

interface UploadSectionProps {
  onFileSelect: (file: File) => Promise<void>;
  isLoading: boolean;
}

export function UploadSection({ onFileSelect, isLoading }: UploadSectionProps) {
  const t = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.[0] && !isLoading) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, isLoading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
    disabled: isLoading,
  });

  const handleSampleClick = async (imageNumber: number) => {
    if (!isLoading) {
      try {
        const response = await fetch(`/images/simple${imageNumber}.jpg`);
        const blob = await response.blob();
        const file = new File([blob], `sample${imageNumber}.jpg`, {
          type: "image/jpeg",
        });
        await onFileSelect(file);
      } catch (error) {
        console.error("Error loading sample image:", error);
      }
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧说明文字和图片 */}
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">{t("upload.title")}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t("upload.description")}
          </p>
          <Image
            src="/images/undraw_image_viewer.svg"
            alt="Upload illustration"
            width={400}
            height={300}
            className="mt-4"
          />
        </div>

        {/* 右侧上传区域 */}
        <div className="flex flex-col">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-8">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
              id="file-upload"
            />
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg">{t("upload.dragText")}</p>
              <p className="mt-2">{t("upload.orText")}</p>
              <button
                onClick={handleButtonClick}
                className="mt-4 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium"
              >
                {t("upload.selectFile")}
              </button>
              <p className="mt-2 text-sm">{t("upload.supportedFormats")}</p>
            </div>
          </div>

          {/* 示例图片部分 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("upload.sampleImages")}
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleSampleClick(i)}
                >
                  <Image
                    src={`/images/simple${i}.jpg`}
                    alt={`Sample ${i}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
