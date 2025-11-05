// app/(project)/pages/projects/[id]/upload-minute/real-time/page.tsx
"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Link from "next/link";
import {
  Mic,
  Share2,
  Clock,
  Home,
  Download,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { MeetingsApi } from "@/lib/api/meeting";

/** Kiểu tạm cho Web Speech API để tránh lỗi TS */
type SpeechRecognitionType = typeof window extends any
  ? (Window & { webkitSpeechRecognition?: any; SpeechRecognition?: any })["SpeechRecognition"]
  : any;

export default function RealtimeMeeting() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const [isRecording, setIsRecording] = useState(false);

  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");

  const [transcriptHistory, setTranscriptHistory] = useState<
    { timestamp: string; text: string }[]
  >([]);

  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);

  const realtimeDisplay = useMemo(() => {
    const base = finalText.trim();
    if (interimText.trim()) {
      return (base ? base + " " : "") + interimText.trim();
    }
    return base;
  }, [finalText, interimText]);

  const nowHHMMSS = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      setSupported(false);
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      let nextInterim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = (res[0]?.transcript ?? "").trim();
        if (!text) continue;
        if (res.isFinal) {
          finalChunk += (finalChunk ? " " : "") + text;
        } else {
          nextInterim = text;
        }
      }

      setInterimText(nextInterim);

      if (finalChunk) {
        setFinalText((prev) => (prev ? prev + " " : "") + finalChunk);
        setTranscriptHistory((h) => [
          { timestamp: nowHHMMSS(), text: finalChunk },
          ...h,
        ]);
      }
    };

    rec.onerror = (e: any) => {
      console.error("SpeechRecognition error:", e);
    };

    rec.onend = () => {
      if (isRecording) {
        try {
          rec.start();
        } catch {}
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, [isRecording]);

  const handleStart = async () => {
    if (!supported) return;
    const rec = recognitionRef.current;
    if (!rec) return;

    if (isRecording) {
      setIsRecording(false);
      try {
        rec.stop();
      } catch {}
      setFinalText((prev) =>
        interimText.trim() ? (prev ? prev + " " : "") + interimText.trim() : prev
      );
      setInterimText("");
    } else {
      setIsRecording(true);
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        rec.start();
      } catch (err) {
        console.error("Mic permission denied:", err);
        setIsRecording(false);
      }
    }
  };

  const handleClear = () => {
    setFinalText("");
    setInterimText("");
    setTranscriptHistory([]);
  };

  const handleExport = () => {
    const full = [finalText.trim(), interimText.trim()].filter(Boolean).join(" ").trim();
    const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `transcript-${ts}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /** Helper OPTIONAL: tạo meeting minute từ transcript (không đổi UI) */
  const createMinuteFromTranscript = async () => {
    try {
      const content = [finalText.trim(), interimText.trim()].filter(Boolean).join(" ").trim();
      if (!content) return;
      const b64 = btoa(unescape(encodeURIComponent(content))); // text -> base64
      const resp = await MeetingsApi.process({
        files: b64,
        language: String(locale || "en"),
        project_id: Number(id),
        source: "realtime",
        meeting_link: "",
        location: "",
        actual_start: new Date(),
        actual_end: new Date(),
      });
      // điều hướng tới detail nếu muốn
      // router.push(...);
      alert(`Created minute #${resp.minute_id} from realtime transcript`);
    } catch (e) {
      console.error(e);
      alert("Failed to create minute from transcript");
    }
  };

  const handleShareScreen = () => console.log("Start screen share… (not implemented)");

  return (
    <div className="p-8 space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                <Mic className="w-4 h-4" />
              </div>
              Realtime Meeting
            </h1>
            <p className="text-sm text-gray-600 mt-1">Real-time transcript using browser</p>
          </div>

          <Link
            href={`/`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {!supported && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div>
              Trình duyệt của bạn chưa hỗ trợ Web Speech API (SpeechRecognition).
              Hãy dùng Chrome/Edge mới hoặc tích hợp backend STT (Whisper, Google, v.v.).
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                <Mic className="w-4 h-4" />
              </div>
              Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90"
                disabled={!supported}
              >
                {isRecording ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>

              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={handleShareScreen}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4" />
                Share Screen
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                <Mic className="w-4 h-4" />
              </div>
              Transcript (Realtime)
            </h2>
            <textarea
              value={realtimeDisplay}
              onChange={(e) => {
                setFinalText(e.target.value);
                setInterimText("");
              }}
              placeholder='Click "Start" to begin recording the meeting'
              className="w-full h-44 p-4 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                <Clock className="w-4 h-4" />
              </div>
              Transcript History – {transcriptHistory.length} entries
            </h2>

            <div className="space-y-3">
              {transcriptHistory.map((entry, idx) => (
                <div key={`${entry.timestamp}-${idx}`} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-600 font-mono text-xs font-semibold min-w-fit">
                    {entry.timestamp}
                  </span>
                  <span className="text-gray-800 text-sm">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center text-gray-700">
              <Share2 className="w-4 h-4" />
            </div>
            Screen Share
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50">
            <Share2 className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-4">No screen sharing yet</p>

            <button
              onClick={handleShareScreen}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4" />
              Start Sharing
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Real-time transcription and AI-powered minute generation during sharing.
          </p>
        </div>
      </div>
    </div>
  );
}
