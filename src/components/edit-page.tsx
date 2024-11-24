import { Button } from "@/components/ui/button";
import { CheckerboardBackground } from "@/components/checkerboard-background";
import Image from "next/image";
import { Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/i18n/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface EditPageProps {
  imageUrl: string;
  originalUrl: string;
  onDownload: () => void;
  dimensions: { width: number; height: number };
}

export function EditPage({
  imageUrl,
  originalUrl,
  onDownload,
  dimensions,
}: EditPageProps) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [sliderPosition, setSliderPosition] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseLeave = () => {
    setSliderPosition(100);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex">
      <div className="flex-1 relative p-8">
        <div className="relative h-full w-full flex items-center justify-center">
          <CheckerboardBackground className="rounded-lg" />
          {showAnimation ? (
            // 初始动画效果
            <div className="relative max-w-full max-h-full">
              <div className="relative w-fit rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Edited image"
                  width={1200}
                  height={800}
                  className="max-w-[calc(100vw-400px)] max-h-[calc(100vh-96px)] w-auto h-auto object-contain rounded-lg"
                  priority
                />
                <motion.div
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0 0 0)" }}
                  transition={{
                    duration: 1.2,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.3,
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={originalUrl}
                    alt="Original image"
                    width={1200}
                    height={800}
                    className="max-w-[calc(100vw-400px)] max-h-[calc(100vh-96px)] w-auto h-auto object-contain rounded-lg"
                    priority
                  />
                </motion.div>
              </div>
            </div>
          ) : (
            // 滑块对比效果
            <div
              ref={containerRef}
              className="relative max-w-full max-h-full w-fit cursor-col-resize rounded-lg overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={imageUrl}
                alt="Edited image"
                width={1200}
                height={800}
                className="max-w-[calc(100vw-400px)] max-h-[calc(100vh-96px)] w-auto h-auto object-contain"
                priority
              />
              <div
                className="absolute inset-0 transition-all duration-150 ease-out"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <Image
                  src={originalUrl}
                  alt="Original image"
                  width={1200}
                  height={800}
                  className="max-w-[calc(100vw-400px)] max-h-[calc(100vh-96px)] w-auto h-auto object-contain"
                  priority
                />
              </div>
              {/* 滑块分割线 */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-col-resize transition-all duration-150 ease-out"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-0.5 h-4 bg-gray-400/80 mx-0.5" />
                  <div className="w-0.5 h-4 bg-gray-400/80 mx-0.5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧下载面板 */}
      <div className="w-80 border-l p-4 flex flex-col">
        <div className="space-y-4">
          <Button className="w-full" onClick={onDownload}>
            {t("editPage.download")}
          </Button>
          <div className="flex items-center justify-center text-sm text-gray-500 gap-1">
            {dimensions.width} × {dimensions.height} px
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("editPage.dimensions")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
