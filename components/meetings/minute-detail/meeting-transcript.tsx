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

const datePill =
  "inline-block rounded-md bg-purple-50 text-purple-700 font-medium px-2 py-0.5 text-xs";

const timePill =
  "inline-block rounded-md bg-teal-50 text-teal-700 font-medium px-2 py-0.5 text-xs";

const weekdayPill =
  "inline-block rounded-md bg-orange-50 text-orange-700 font-medium px-2 py-0.5 text-xs";

const redPill =
  "inline-block rounded-md bg-red-100 text-red-700 font-medium px-2 py-0.5 text-xs";
const greenPill =
  "inline-block rounded-md bg-green-100 text-green-700 font-medium px-2 py-0.5 text-xs";

// Pattern cho thứ trong tuần (tiếng Anh và tiếng Việt)
const weekdayPattern = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Thứ Hai|Thứ Ba|Thứ Tư|Thứ Năm|Thứ Sáu|Thứ Bảy|Chủ Nhật)\b/gi;

// Pattern cho thời gian (time)
const timePatterns = [
  // HH:MM AM/PM (ví dụ: 12:00 AM, 10:30 PM)
  /\b(\d{1,2}:\d{2}\s+(?:AM|PM|am|pm|a\.m\.|p\.m\.))\b/gi,
  // HH AM/PM (ví dụ: 10 AM, 3 PM)
  /\b(\d{1,2}\s+(?:AM|PM|am|pm|a\.m\.|p\.m\.))\b/gi,
  // HH:MM:SS hoặc HH:MM (24h format, ví dụ: 14:30:00, 09:15)
  // Chỉ match giờ hợp lý (00-23):phút hợp lý (00-59):giây hợp lý (00-59) hoặc không có giây
  /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?(?!\s*[ap]\.?m\.?)\b/g,
];

// Pattern cho ngày tháng (nhiều định dạng)
const months = "January|February|March|April|May|June|July|August|September|October|November|December";
const monthsShort = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
const ordinalSuffix = "(?:st|nd|rd|th)";

const datePatterns = [
  // DD/MM/YYYY hoặc DD-MM-YYYY hoặc DD.MM.YYYY
  /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/g,
  // MM/DD/YYYY (định dạng Mỹ)
  /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
  // YYYY-MM-DD (ISO format)
  /\b(\d{4}-\d{1,2}-\d{1,2})\b/g,
  // Time Month Day, Year (ví dụ: 12:00 AM, November 6, 2025)
  new RegExp(`\\b(\\d{1,2}:\\d{2}\\s+(?:AM|PM|am|pm|a\\.m\\.|p\\.m\\.),\\s+(${months})\\s+\\d{1,2}(?:${ordinalSuffix})?,\\s+\\d{2,4})\\b`, "gi"),
  // Month Day, Year (ví dụ: November 6, 2025)
  new RegExp(`\\b((${months})\\s+\\d{1,2}(?:${ordinalSuffix})?,\\s+\\d{2,4})\\b`, "gi"),
  // Day Month Year (ví dụ: 6 November 2025)
  new RegExp(`\\b(\\d{1,2}(?:${ordinalSuffix})?\\s+(${months})\\s+\\d{2,4})\\b`, "gi"),
  // Month Day Year (ví dụ: November 6 2025)
  new RegExp(`\\b((${months})\\s+\\d{1,2}(?:${ordinalSuffix})?\\s+\\d{2,4})\\b`, "gi"),
  // Time Short month format (ví dụ: 12:00 AM, Nov 6, 2025)
  new RegExp(`\\b(\\d{1,2}:\\d{2}\\s+(?:AM|PM|am|pm|a\\.m\\.|p\\.m\\.),\\s+(${monthsShort})\\s+\\d{1,2}(?:${ordinalSuffix})?,\\s+\\d{2,4})\\b`, "gi"),
  // Short month format (ví dụ: Nov 6, 2025)
  new RegExp(`\\b((${monthsShort})\\s+\\d{1,2}(?:${ordinalSuffix})?,\\s+\\d{2,4})\\b`, "gi"),
  // Day Short Month Year (ví dụ: 6 Nov 2025)
  new RegExp(`\\b(\\d{1,2}(?:${ordinalSuffix})?\\s+(${monthsShort})\\s+\\d{2,4})\\b`, "gi"),
  // Short Month Day Year (ví dụ: Nov 6 2025)
  new RegExp(`\\b((${monthsShort})\\s+\\d{1,2}(?:${ordinalSuffix})?\\s+\\d{2,4})\\b`, "gi"),
  // Ngày DD tháng MM năm YYYY (tiếng Việt)
  /\b(ngày\s+\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{2,4})\b/gi,
  // DD tháng MM năm YYYY
  /\b(\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{2,4})\b/gi,
];

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

// Highlight tất cả các pattern: tên, thứ trong tuần, thời gian, và ngày tháng
function highlightText(text: string, namesRx: RegExp | null) {
  type HighlightSpan = {
    start: number;
    end: number;
    type: "name" | "weekday" | "time" | "date";
    content: string;
  };

  const highlights: HighlightSpan[] = [];

  // Thu thập highlights từ tên
  if (namesRx) {
    let match;
    while ((match = namesRx.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "name",
        content: match[0],
      });
    }
  }

  // Thu thập highlights từ thứ trong tuần
  weekdayPattern.lastIndex = 0;
  let match;
  while ((match = weekdayPattern.exec(text)) !== null) {
    highlights.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "weekday",
      content: match[0],
    });
  }

  // Thu thập highlights từ thời gian (time)
  for (const pattern of timePatterns) {
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "time",
        content: match[0],
      });
    }
  }

  // Thu thập highlights từ ngày tháng
  for (const pattern of datePatterns) {
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "date",
        content: match[0],
      });
    }
  }

  // Sắp xếp theo priority trước (name > weekday > date > time), sau đó theo độ dài (dài trước) để ưu tiên pattern dài hơn
  // Date có priority cao hơn time vì date pattern có thể chứa time và có nhiều thông tin hơn
  const priority = { name: 0, weekday: 1, date: 2, time: 3 };
  highlights.sort((a, b) => {
    const priorityDiff = priority[a.type] - priority[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Nếu cùng priority, sắp xếp theo độ dài (dài trước) để ưu tiên pattern dài hơn khi loại bỏ overlaps
    const aLength = a.end - a.start;
    const bLength = b.end - b.start;
    if (aLength !== bLength) return bLength - aLength; // Dài trước
    
    // Nếu cùng độ dài, sắp xếp theo vị trí
    if (a.start !== b.start) return a.start - b.start;
    // Nếu cùng vị trí và độ dài, giữ nguyên thứ tự
    return 0;
  });

  // Loại bỏ overlaps (ưu tiên highlight có priority cao hơn và được thêm trước)
  const filtered: HighlightSpan[] = [];
  for (const h of highlights) {
    const overlaps = filtered.some(
      (f) => !(h.end <= f.start || h.start >= f.end)
    );
    if (!overlaps) {
      filtered.push(h);
    }
  }

  // Sắp xếp lại filtered theo vị trí trong text để render đúng thứ tự
  filtered.sort((a, b) => a.start - b.start);

  // Tạo React nodes
  const out: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const h of filtered) {
    if (lastIndex < h.start) {
      out.push(text.slice(lastIndex, h.start));
    }

    let className = namePill;
    if (h.type === "weekday") className = weekdayPill;
    else if (h.type === "time") className = timePill;
    else if (h.type === "date") className = datePill;

    out.push(
      <span key={`${h.type}-${h.start}-${h.end}`} className={className}>
        {h.content}
      </span>
    );

    lastIndex = h.end;
  }

  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }

  return out.length > 0 ? out : [text];
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

            {/* Nội dung + highlight tên, thứ trong tuần, và ngày tháng */}
            <span className="align-middle">
              {highlightText(line.text, namesRx)}
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