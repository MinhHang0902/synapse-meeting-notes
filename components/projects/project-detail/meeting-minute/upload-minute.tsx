// app/(project)/pages/projects/[id]/upload-minute/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, FileAudio2, Mic, ShieldCheck, CheckCircle2 } from "lucide-react";
import * as React from "react";
import { MeetingsApi } from "@/lib/api/meeting";

export default function UploadMinute() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const router = useRouter();

  const formats = ["MP3", "WAV", "M4A", "OGG", "TXT", "MD"];

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState<"vi" | "en">("vi");

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
  };

  // GỬI FILE TRỰC TIẾP, KHÔNG base64
  const handleGenerateMinute = async () => {
    if (!selectedFile) return;
    try {
      setSubmitting(true);

      await MeetingsApi.process({
        // gửi đúng kiểu File/Blob theo interface mới
        files: selectedFile,
        language: selectedLanguage,
        project_id: Number(id),
        source: "upload",
        meeting_link: "",
        location: "",
        actual_start: new Date(),
        actual_end: new Date(),
      });

      alert("Upload thành công!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      console.error(e);
      alert("Process failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                <UploadCloud className="w-4 h-4" />
              </div>
              Upload Audio & Transcript
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Language:</label>
              <Select value={selectedLanguage} onValueChange={(value: "vi" | "en") => setSelectedLanguage(value)}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue>
                    {selectedLanguage === "vi" ? "Tiếng Việt" : "English"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-white hover:border-gray-400 transition-colors">
            <FileAudio2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-800 font-medium mb-1">
              Drag and drop your files here
            </p>
            <p className="text-xs text-gray-500 mb-4">or</p>
            <Button className="bg-black text-white hover:bg-black/90" onClick={handleBrowseClick}>
              Browse File
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              // có thể bật multiple nếu BE hỗ trợ mảng File:
              // multiple
              accept=".mp3,.wav,.m4a,.ogg,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900 mb-2">Uploaded</p>
              <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button onClick={handleGenerateMinute} disabled={submitting} className="bg-black text-white hover:bg-black/90">
                  {submitting ? "Processing…" : "Generate Minute"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-900 mb-2">Supports</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {formats.map((f) => (
                <span key={f} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                  {f}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">Audio files or text transcripts</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center text-gray-700">
              <Mic className="w-4 h-4" />
            </div>
            Record Meeting Realtime
          </h2>

          <div className="rounded-lg border border-gray-200 p-8 text-center bg-gray-50">
            <Mic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-800 mb-4">Ready to record</p>
            <Button className="bg-black text-white hover:bg-black/90">
              <Link href={`/${locale}/pages/projects/${id}/upload-minute/real-time`}>Start Recording</Link>
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Real-time transcription and AI-powered minute generation
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md">
            <ShieldCheck className="w-4 h-4 text-gray-700" />
          </div>
          <div className="text-sm text-gray-600">
            Your files are processed securely. We respect your privacy and data security.
          </div>
        </div>
      </div>
    </div>
  );
}
