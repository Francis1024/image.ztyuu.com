"use client";

import { useState, useEffect, useRef } from "react";

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
  error?: string;
}

export default function Home() {
  const [resultUrl, setResult] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("等待模型加载...");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      console.log("初始化 Worker...");
      worker.current = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      });
    }

    const onMessageReceived = (e: MessageEvent<WorkerMessage>) => {
      console.log("收到 Worker 消息:", e.data);

      switch (e.data.status) {
        case "initiate":
          setReady(false);
          setStatus("正在初始化模型...");
          break;

        case "loading":
          setReady(false);
          setStatus(e.data.message || "加载中...");
          break;

        case "ready":
          console.log("模型加载完成");
          setReady(true);
          setStatus("模型已就绪，可以开始处理图片");
          setIsProcessing(false);
          break;

        case "processing":
          setStatus(e.data.message || "处理中...");
          setIsProcessing(true);
          break;

        case "complete":
          console.log("处理完成，开始生成结果图片");
          if (e.data.mask && imageUrl) {
            const mask = e.data.mask;
            const image = new Image();
            image.src = imageUrl;

            image.onload = () => {
              console.log("原始图片尺寸:", image.width, "x", image.height);
              const canvas = document.createElement("canvas");
              canvas.width = image.width;
              canvas.height = image.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                console.error("无法获取 canvas context");
                return;
              }

              // 绘制原始图片
              console.log("绘制原始图片");
              ctx.drawImage(image, 0, 0);

              // 更新 alpha 通道
              console.log("更新 alpha 通道");
              const pixelData = ctx.getImageData(
                0,
                0,
                image.width,
                image.height
              );
              for (let i = 0; i < mask.data.length; ++i) {
                pixelData.data[4 * i + 3] = mask.data[i];
              }
              ctx.putImageData(pixelData, 0, 0);

              // 转换为 data URL
              console.log("生成最终图片");
              const resultUrl = canvas.toDataURL("image/png");
              setResult(resultUrl);
              setStatus("处理完成！");
              setIsProcessing(false);
            };
          }
          break;

        case "error":
          console.error("处理错误:", e.data.error);
          setStatus(`错误: ${e.data.message || "处理过程中出错"}`);
          setIsProcessing(false);
          break;
      }
    };

    worker.current.addEventListener("message", onMessageReceived);

    return () => {
      console.log("清理 Worker...");
      worker.current?.removeEventListener("message", onMessageReceived);
    };
  }, [imageUrl]);

  const handleImageUploaded = (url: string) => {
    console.log("开始上传图片:", url);
    setResult(null);
    setStatus("准备处理图片...");
    if (worker.current) {
      worker.current.postMessage({ url });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!ready) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!ready) return;
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      handleImageUploaded(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      handleImageUploaded(url);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = "removed-background.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderUploadIcon = () => (
    <>
      <svg
        className="w-12 h-12 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-gray-500">
        {ready ? "拖拽图片到这里，或点击选择图片" : status}
      </p>
    </>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-bold mb-2 text-center">背景移除工具</h1>
      <h2 className="text-2xl mb-4 text-center">上传图片来移除背景</h2>

      <div className="mb-4 text-center">
        <p
          className={`text-sm ${
            isProcessing ? "text-blue-500" : "text-gray-500"
          }`}
        >
          {status}
        </p>
      </div>

      <div className="flex gap-8 w-full justify-center">
        <div
          className={`w-full max-w-xl h-96 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 mt-8 relative ${
            !ready ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            disabled={!ready}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
          />
          {!imageUrl ? (
            renderUploadIcon()
          ) : (
            <img
              src={imageUrl}
              alt="Uploaded image"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {resultUrl && (
          <div className="w-full max-w-xl h-96 mt-8 flex flex-col items-center">
            <div className="border-2 border-gray-300 rounded-lg p-6 h-full w-full flex items-center justify-center">
              <img
                src={resultUrl}
                alt="Result image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <button
              onClick={handleDownload}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
