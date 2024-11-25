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
import { motion, AnimatePresence } from "framer-motion";

interface EditPageProps {
  imageUrl: string;
  originalUrl: string;
  onDownload: (quality: "normal" | "hd") => void;
  dimensions: { width: number; height: number };
  children: React.ReactNode;
}

export function EditPage({
  imageUrl,
  originalUrl,
  onDownload,
  dimensions,
  children,
}: EditPageProps) {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedImages = useRef({ edited: false, original: false });
  const animationTimers = useRef<Array<NodeJS.Timeout>>([]);
  const t = useI18n();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isAutoAnimating) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const clearAnimationTimers = () => {
    animationTimers.current.forEach((timer) => clearTimeout(timer));
    animationTimers.current = [];
  };

  const triggerAutoAnimation = () => {
    clearAnimationTimers();

    setIsAutoAnimating(true);
    setSliderPosition(0);

    const timer1 = setTimeout(() => {
      setSliderPosition(100);
    }, 500);

    const timer2 = setTimeout(() => {
      setIsAutoAnimating(false);
    }, 3000);

    animationTimers.current = [timer1, timer2];
  };

  const handleImageLoad = (type: "edited" | "original") => {
    loadedImages.current[type] = true;
    if (loadedImages.current.edited && loadedImages.current.original) {
      setImagesLoaded(true);
    }
  };

  useEffect(() => {
    if (imagesLoaded) {
      triggerAutoAnimation();
    }
  }, [imagesLoaded]);

  useEffect(() => {
    clearAnimationTimers();
    loadedImages.current = { edited: false, original: false };
    setImagesLoaded(false);
    setSliderPosition(0);
    setIsAutoAnimating(false);
  }, [imageUrl, originalUrl]);

  useEffect(() => {
    return () => {
      clearAnimationTimers();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] h-[calc(100vh-var(--header-height))] flex flex-col">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative p-4 flex flex-col">
          <div className="relative flex-1 w-full flex items-center justify-center">
            <CheckerboardBackground className="rounded-lg" />
            <div
              ref={containerRef}
              className="relative max-w-full max-h-full w-fit cursor-col-resize rounded-lg overflow-hidden"
              onMouseMove={handleMouseMove}
            >
              <Image
                src={imageUrl}
                alt="Edited image"
                width={1200}
                height={800}
                className="max-w-[calc(100vw-400px)] max-h-[calc(100vh-var(--header-height)-200px)] w-auto h-auto object-contain"
                priority
                onLoad={() => handleImageLoad("edited")}
              />
              <div
                className="absolute inset-0"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                  transition: isAutoAnimating
                    ? "clip-path 2.4s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                }}
              >
                <Image
                  src={originalUrl}
                  alt="Original image"
                  width={1200}
                  height={800}
                  className="max-w-[calc(100vw-400px)] max-h-[calc(100vh-var(--header-height)-200px)] w-auto h-auto object-contain"
                  priority
                  onLoad={() => handleImageLoad("original")}
                />
              </div>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-col-resize"
                style={{
                  left: `${sliderPosition}%`,
                  transition: isAutoAnimating
                    ? "left 2.4s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-0.5 h-4 bg-gray-400/80 mx-0.5" />
                  <div className="w-0.5 h-4 bg-gray-400/80 mx-0.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            <div className="whitespace-nowrap">{children}</div>
          </div>
        </div>

        <div className="w-80 border-l p-4 flex flex-col">
          <div className="space-y-4">
            <Button className="w-full" onClick={() => onDownload("normal")}>
              {t("editPage.download")}
            </Button>
            {dimensions && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
