"use client";

import {
  FileText,
  Sheet,
  Image as ImageIcon,
  Presentation,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

type Minute = {
  id: number;
  fileName: string;
  uploader: string;
  uploadDate: string;
  fileType: string;
};

export default function ProjectMinutes({
  meetingMinutes,
  // projectId
}: {
  meetingMinutes: Minute[];
  // projectId: string;
}) {
  const { id, locale } = useParams();

  const iconByType = (t: Minute["fileType"]) => {
    switch (t) {
      case "pdf":
      case "word":
        return <FileText className="w-4 h-4" />;
      case "excel":
        return <FileSpreadsheet className="w-4 h-4" />;
      case "powerpoint":
        return <Presentation className="w-4 h-4" />;
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <Sheet className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header + Upload button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Meeting Minutes
        </h2>

        <Button asChild
          className="bg-black hover:bg-black/90 text-white gap-2 text-sm px-3 py-2"
        >
          <Link href={`/${locale}/pages/projects/${id}/upload-minute`}>
            <Upload size={14} />
            Upload Minute
          </Link>
        </Button>
      </div>

      {/* List of minutes */}
      <div className="divide-y divide-gray-100">
        {meetingMinutes.map((f) => (
          <div
            key={f.id}
            className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-md px-1 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-800">
                {iconByType(f.fileType)}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {f.fileName}
                </div>
                <div className="text-xs text-gray-500">
                  Uploaded by {f.uploader} • {f.uploadDate}
                </div>
              </div>
            </div>
            <Link
              href={`/${locale}/pages/projects/${id}/meeting-detail/${f.id}?file=${encodeURIComponent(f.fileName)}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
