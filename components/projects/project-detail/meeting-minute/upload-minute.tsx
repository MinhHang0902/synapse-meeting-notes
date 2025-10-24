"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    UploadCloud,
    FileAudio2,
    Mic,
    ShieldCheck,
} from "lucide-react";

export default function UploadMinute() {
    const { id, locale } = useParams();

    const formats = ["MP3", "WAV", "M4A", "OGG", "TXT", "MD"];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                            <UploadCloud className="w-4 h-4" />
                        </div>
                        Upload Audio & Transcript
                    </h2>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-white hover:border-gray-400 transition-colors">
                        <FileAudio2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-800 font-medium mb-1">
                            Drag and drop your files here
                        </p>
                        <p className="text-xs text-gray-500 mb-4">or</p>
                        <Button
                            className="bg-black text-white hover:bg-black/90"
                            onClick={() => console.log("Browse Files clicked")}
                        >
                            Browse Files
                        </Button>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-medium text-gray-900 mb-2">Supports</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formats.map((f) => (
                                <span
                                    key={f}
                                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                                >
                                    {f}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Audio files or text transcripts
                        </p>
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
                        <p className="text-sm font-medium text-gray-800 mb-4">
                            Ready to record
                        </p>
                        <Button className="bg-black text-white hover:bg-black/90">
                            <Link href={`/${locale}/pages/projects/${id}/upload-minute/real-time`}>
                                Start Recording
                            </Link>
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
