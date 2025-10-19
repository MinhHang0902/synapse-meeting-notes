"use client";

import * as React from "react";

/* ---------- Types ---------- */
export interface Speaker {
  name: string;
  color: string; // vẫn giữ để tương thích, nhưng màu pill đã đồng bộ xanh
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

const namePill =
  "inline-block rounded-md bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 leading-none";

const redPill =
  "inline-block rounded-md bg-red-100 text-red-700 font-medium px-2 py-0.5 text-xs";
const greenPill =
  "inline-block rounded-md bg-green-100 text-green-700 font-medium px-2 py-0.5 text-xs";

// Tạo pattern highlight từ danh sách tên (full + first name)
function buildNameRegex(speakers: Record<string, Speaker>) {
  const names = Object.keys(speakers);
  const firstNames = names.map((n) => n.split(" ")[0]).filter(Boolean);
  const uniq = Array.from(new Set([...names, ...firstNames])).sort(
    (a, b) => b.length - a.length // dài trước để khớp chính xác
  );
  if (!uniq.length) return null;
  const esc = uniq.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${esc.join("|")})\\b`, "g");
}

function highlightNames(text: string, rx: RegExp | null) {
  if (!rx) return [text];
  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  text.replace(rx, (match, _g1, offset) => {
    if (lastIndex < offset) out.push(text.slice(lastIndex, offset));
    out.push(
      <span key={`${match}-${offset}`} className={namePill}>
        {match}
      </span>
    );
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out;
}

const MeetingTranscript: React.FC<MeetingTranscriptProps> = ({
  lines,
  speakers,
  className,
}) => {
  const namesRx = React.useMemo(() => buildNameRegex(speakers), [speakers]);

  return (
    <div className={className}>
      {/* Header với background gray full width */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg px-6 py-5 border-b border-gray-200 -mx-6 -mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Original Transcript
        </h2>
        <p className="text-sm text-gray-600">
          Raw content extracted from the uploaded file
        </p>
      </div>

      {/* Nội dung transcript */}
      <div className="pt-5 space-y-3">
        {lines.map((line, idx) => (
          <div key={idx} className="leading-6 text-sm text-gray-800">
            {/* Speaker pill + dấu : */}
            <span className={namePill}>{line.speaker}</span>
            <span className="mx-1 text-gray-500">:</span>

            {/* Nội dung + highlight tên trong câu */}
            <span className="align-middle">
              {highlightNames(line.text, namesRx)}
              {line.actionItem && (
                <span className={`${redPill} ml-2`}>{line.actionItem}</span>
              )}
              {line.time && (
                <span className={`${greenPill} ml-2`}>{line.time}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingTranscript;