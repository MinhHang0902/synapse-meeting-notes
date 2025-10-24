"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function RealtimeMeeting() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcriptHistory] = useState([
    { timestamp: "21:57:01", text: "12345678." },
    { timestamp: "21:57:00", text: "U." },
  ]);

  const handleStart = () => setIsRecording((v) => !v);
  const handleClear = () => setTranscript("");
  const handleExport = () => console.log("Exporting transcript…");
  const handleShareScreen = () => console.log("Start screen share…");

  return (
    <div className="space-y-8">
      {/* Header card (đồng bộ ProjectOverview) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                <Mic className="w-4 h-4" />
              </div>
              Realtime Meeting
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time transcript using browser
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>

      {/* Main grid: trái rộng (2 cột) + phải (1 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Transcript + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls (gọn, đồng bộ nút) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Controls</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90"
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

          {/* Transcript */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Transcript (Realtime)
              </h2>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder='Click "Start" to begin recording the meeting'
              className="w-full h-44 p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Transcript History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Transcript History — {transcriptHistory.length} entries
              </h2>
            </div>

            <div className="space-y-3">
              {transcriptHistory.map((entry, idx) => (
                <div
                  key={`${entry.timestamp}-${idx}`}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-blue-600 font-mono text-xs font-semibold min-w-fit">
                    {entry.timestamp}
                  </span>
                  <span className="text-gray-800 text-sm">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Screen Share */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-4 h-4 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Screen Share</h2>
            </div>

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
    </div>
  );
}
