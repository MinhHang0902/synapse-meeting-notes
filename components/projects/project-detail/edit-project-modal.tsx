"use client";

import { useEffect, useState } from "react";
import { FilePenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditProjectModal({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues?: { name: string; description: string };
  onSubmit?: (data: { name: string; description: string }) => void;
}) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");

  useEffect(() => {
    setName(defaultValues?.name ?? "");
    setDescription(defaultValues?.description ?? "");
  }, [defaultValues]);

  const canSave = name.trim().length > 0;

  const handleClose = (v: boolean) => {
    if (!v) {
      setName(defaultValues?.name ?? "");
      setDescription(defaultValues?.description ?? "");
    }
    onOpenChange(v);
  };

  const handleSubmit = () => {
    if (!canSave) return;
    onSubmit?.({ name: name.trim(), description: description.trim() });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal role="dialog">
      <div className="absolute inset-0 bg-black/50" onClick={() => handleClose(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-start justify-between sticky top-0 z-20 rounded-t-2xl border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FilePenLine className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Edit Project</h2>
            </div>
            <p className="text-white/70 text-sm">Update your project information</p>
          </div>
          <button
            aria-label="Close"
            onClick={() => handleClose(false)}
            className="text-white/90 hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 bg-white">
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              Description
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter project description..."
              className="w-full p-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <Button
            variant="outline"
            className="px-6 bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100"
            onClick={() => handleClose(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            onClick={handleSubmit}
            className={`px-6 text-white ${
              canSave
                ? "bg-black hover:bg-black/90"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save Change
          </Button>
        </div>
      </div>
    </div>
  );
}