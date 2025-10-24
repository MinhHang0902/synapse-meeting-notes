"use client";

import { useState } from "react";
import { Play, Trash2, Download, Share2, Clock, Mic, Home } from "lucide-react";
import Link from "next/link";

export default function RealtimeMeeting() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState([
    { timestamp: "21:57:01", text: "12345678." },
    { timestamp: "21:57:00", text: "U." },
  ]);

  const handleStart = () => setIsRecording((v) => !v);
  const handleClear = () => setTranscript("");
  const handleExport = () => {
    // TODO: export transcript
    console.log("Exporting transcript...");
  };
  const handleShareScreen = () => {
    // TODO: screen share
    console.log("Starting screen share...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Realtime Meeting</h1>
          <p className="text-gray-600 mt-1">Real-time transcript using browser</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Toolbar */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleStart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <Play size={20} />
            {isRecording ? "Stop" : "Start"}
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-lg border border-gray-300 flex items-center justify-center gap-2"
          >
            <Trash2 size={20} />
            Clear
          </button>
          <button
            onClick={handleExport}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-lg border border-gray-300 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={handleShareScreen}
            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            Share Screen
          </button>
        </div>

        {/* Transcript Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Mic size={20} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Transcript (Realtime)</h2>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder='Click "Start" to begin recording the meeting'
            className="w-full h-40 p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Transcript History */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Transcript History (with Timestamps) - {transcriptHistory.length} entries
            </h2>
          </div>
          <div className="space-y-3">
            {transcriptHistory.map((entry, index) => (
              <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-blue-600 font-mono text-sm font-semibold min-w-fit">
                  {entry.timestamp}
                </span>
                <span className="text-gray-700">{entry.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Screen Share Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Share2 size={20} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Screen share</h2>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center bg-gray-50">
            <Share2 size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 mb-6">No screen sharing yet</p>
            <button className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2">
              <Share2 size={18} />
              Start Sharing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
