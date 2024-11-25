"use client";

import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";

interface ImageListProps {
  images: Array<{
    id: string;
    originalUrl: string;
    processedUrl: string;
  }>;
  currentImageId: string | null;
  onAddClick: () => void;
  onImageSelect: (id: string) => void;
  onImageDelete: (id: string) => void;
}

export function ImageList({
  images,
  currentImageId,
  onAddClick,
  onImageSelect,
  onImageDelete,
}: ImageListProps) {
  const t = useI18n();

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        <button
          onClick={onAddClick}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
        >
          <Plus className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 max-w-[800px] overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 py-2 pl-2">
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                "group relative flex-shrink-0 w-20 h-20 rounded-lg cursor-pointer",
                currentImageId === image.id ? "ring-2 ring-blue-500" : ""
              )}
              onClick={() => onImageSelect(image.id)}
            >
              <Image
                src={image.originalUrl}
                alt="Image thumbnail"
                width={72}
                height={72}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageDelete(image.id);
                }}
                className="absolute -right-1.5 -bottom-1.5 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 z-10"
                title={t("imageList.deleteImage")}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
