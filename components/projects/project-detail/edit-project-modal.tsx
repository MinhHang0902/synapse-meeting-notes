"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilePenLine, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function EditProjectModal({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultValues?: { name: string; description: string }
  onSubmit?: (data: { name: string; description: string }) => void
}) {
  const [name, setName] = useState(defaultValues?.name ?? "")
  const [description, setDescription] = useState(defaultValues?.description ?? "")

  useEffect(() => {
    setName(defaultValues?.name ?? "")
    setDescription(defaultValues?.description ?? "")
  }, [defaultValues])

  const canSave = name.trim().length > 0

  const handleClose = (v: boolean) => {
    onOpenChange(v)
  }

  const handleSubmit = () => {
    if (!canSave) return
    onSubmit?.({ name: name.trim(), description: description.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden border-0 shadow-2xl max-w-md">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#7b4397] to-[#9f5be8] px-5 py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <FilePenLine className="w-4 h-4" />
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-white text-lg">Edit Project Information</DialogTitle>
              <DialogDescription className="text-white/70 text-xs">
                Update your project’s details
              </DialogDescription>
            </DialogHeader>
          </div>
          <button
            aria-label="Close"
            onClick={() => handleClose(false)}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-white hover:bg-white/25"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="bg-white px-5 pt-5 pb-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-800">
                Project Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1 bg-white"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-800">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter project description..."
                className="w-full mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus-visible:ring-2 focus-visible:ring-black/10 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!canSave}
              onClick={handleSubmit}
              className="rounded-md bg-gradient-to-r from-[#2F6EEB] to-[#2A44A9] text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              Save Change
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}