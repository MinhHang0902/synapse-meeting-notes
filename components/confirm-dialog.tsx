"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils"; // nếu chưa có, thay bằng className nối chuỗi

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  /** Texts */
  title?: string;
  description?: string;

  /** Buttons */
  cancelText?: string;
  confirmText?: string;

  /** Handlers */
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;

  /** Optional: external loading control */
  loading?: boolean;

  /** Optional: className overrides */
  className?: string;
};

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Warning",
  description = "Do you really want to delete this person? This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Delete",
  onConfirm,
  onCancel,
  loading: loadingProp,
  className,
}: ConfirmDeleteDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = loadingProp ?? internalLoading;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      if (loadingProp === undefined) setInternalLoading(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      if (loadingProp === undefined) setInternalLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          // khung + bóng + bo góc
          "max-w-sm p-0 overflow-hidden rounded-2xl shadow-2xl",
          // nền trắng
          "bg-white",
          className
        )}
      >
        {/* Header (theo style mockup) */}
        <AlertDialogHeader className="px-6 pt-6">
          <div className="w-full flex flex-col items-center text-center">
            <div className="mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <AlertDialogTitle className="text-red-500 text-xl font-semibold">
              {title}
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-700 mt-2">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {/* Divider nhẹ */}
        <div className="px-6 pt-4">
          <div className="h-px w-full bg-black/[0.06]" />
        </div>

        {/* Footer (buttons) */}
        <AlertDialogFooter className="px-6 py-4 flex gap-3 sm:justify-end">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={loading}
            className={cn(
              // giữ kích thước & style giống mockup (pill, xám nhạt)
              "bg-gray-100 text-gray-700 hover:bg-gray-200",
              "rounded-full px-5 h-10",
              "border-0 shadow-none"
            )}
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              // nút đỏ, có icon thùng rác
              "bg-red-500 hover:bg-red-600 text-white",
              "rounded-full px-5 h-10",
              "flex items-center gap-2"
            )}
          >
            <Trash2 className="w-4 h-4" />
            {loading ? "Deleting..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
