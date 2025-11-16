"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
};

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Warning",
  description = 'Do you really want to delete this person "Bob Reviewer"? This action cannot be undone.',
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

  // Split description into two lines automatically at sentence boundary
  const [firstLine, secondLine] = description.split("? ");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden",
          "px-2 py-2", 
          className
        )}
      >
        {/* Header */}
        <AlertDialogHeader className="px-2 pt-3 text-center flex flex-col items-center">
          <div className="mb-1">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-red-500 text-xl font-semibold">
            {title}
          </AlertDialogTitle>

          {/* Description: 2 lines, centered */}
          <div className="mt-3 text-gray-700 text-sm text-center leading-relaxed">
            <p>{firstLine}?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>
        </AlertDialogHeader>

        {/* Footer (same style as EditUserModal) */}
        <div className="border-t border-gray-200 px-2 py-3 flex gap-3 justify-center bg-white rounded-b-2xl">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className={cn(
              "px-6 bg-transparent border border-gray-300 text-gray-800",
              "hover:bg-black hover:text-white transition-colors",
              "rounded-lg h-9"
            )}
          >
            <X className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "px-6 text-white bg-red-500 hover:bg-red-600",
              "rounded-lg h-9 flex items-center gap-2",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {loading ? "Deleting..." : confirmText}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
