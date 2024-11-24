import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "处理中..." }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}
