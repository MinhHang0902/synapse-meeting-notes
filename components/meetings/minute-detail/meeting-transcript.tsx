"use client";

import * as React from "react";

/* ---------- Types ---------- */
export interface Speaker {
  name: string;
  color: string;
}

export interface TranscriptLine {
  speaker: string;
  text: string;
  actionItem?: string;
  time?: string;
}

type MeetingTranscriptProps = {
  lines: TranscriptLine[];
  speakers: Record<string, Speaker>;
  className?: string;
};

const MeetingTranscript: React.FC<MeetingTranscriptProps> = ({
  lines,
  speakers,
  className,
}) => {
  return (
    <div className={className}>
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Original Transcript
        </h2>
        <p className="text-sm text-gray-600">
          Raw content extracted from the uploaded file
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {lines.map((line, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-2">
              <span
                className={`font-medium ${
                  speakers[line.speaker]?.color || "text-gray-900"
                }`}
              >
                {line.speaker}
              </span>
              <span className="text-gray-700">
                : {line.text}
                {line.actionItem && (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs ml-1">
                    {line.actionItem}
                  </span>
                )}
                {line.time && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs ml-1">
                    {line.time}
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingTranscript;
