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

const monthPill =
  "inline-block rounded-md bg-pink-50 text-pink-700 font-medium px-2 py-0.5 text-xs";

const yearPill =
  "inline-block rounded-md bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 text-xs";

const numberPill =
  "inline-block rounded-md bg-yellow-50 text-yellow-700 font-medium px-2 py-0.5 text-xs";

const ordinalDayPill =
  "inline-block rounded-md bg-cyan-50 text-cyan-700 font-medium px-2 py-0.5 text-xs";

const redPill =
  "inline-block rounded-md bg-red-100 text-red-700 font-medium px-2 py-0.5 text-xs";
const greenPill =
  "inline-block rounded-md bg-green-100 text-green-700 font-medium px-2 py-0.5 text-xs";

// Pattern cho ngày tháng (nhiều định dạng)
const months = "January|February|March|April|May|June|July|August|September|October|November|December";
const monthsShort = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
const ordinalSuffix = "(?:st|nd|rd|th)";

// Pattern cho thứ trong tuần (tiếng Anh và tiếng Việt)
const weekdayPattern = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Thứ Hai|Thứ Ba|Thứ Tư|Thứ Năm|Thứ Sáu|Thứ Bảy|Chủ Nhật)\b/gi;

// Pattern cho thời gian (time) - mở rộng
const timePatterns = [
  // HH:MM:SS.mmm AM/PM (ví dụ: 12:00:00.000 AM)
  /\b(\d{1,2}:\d{2}:\d{2}(?:\.\d{1,3})?\s+(?:AM|PM|am|pm|a\.m\.|p\.m\.))\b/gi,
  // HH:MM AM/PM (ví dụ: 12:00 AM, 10:30 PM)
  /\b(\d{1,2}:\d{2}\s+(?:AM|PM|am|pm|a\.m\.|p\.m\.))\b/gi,
  // HH AM/PM (ví dụ: 10 AM, 3 PM)
  /\b(\d{1,2}\s+(?:AM|PM|am|pm|a\.m\.|p\.m\.))\b/gi,
  // HH:MM:SS.mmm hoặc HH:MM:SS hoặc HH:MM (24h format với timezone)
  /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d{1,3})?)?\s*(?:UTC|GMT|EST|PST|CST|EDT|PDT|CDT|\+?\d{1,2}:?\d{2}|Z)?\b/gi,
  // HH:MM:SS hoặc HH:MM (24h format, ví dụ: 14:30:00, 09:15)
  /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?(?!\s*[ap]\.?m\.?)\b/g,
  // Time với timezone offset (ví dụ: 14:30:00+05:30, 09:15-08:00)
  /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\s*[+\-]\d{1,2}:?\d{2}\b/g,
];

// Pattern cho tháng (month) - mở rộng để bắt mọi loại pattern month
const monthPatterns = [
  // Tháng đầy đủ tiếng Anh (ví dụ: January, February) - nhưng không nếu là phần của date pattern
  new RegExp(`\\b((${months}))(?!\\s+\\d{1,2}(?:${ordinalSuffix})?[,\\s]\\s*\\d{2,4})\\b`, "gi"),
  // Tháng viết tắt tiếng Anh (ví dụ: Jan, Feb) - nhưng không nếu là phần của date pattern
  new RegExp(`\\b((${monthsShort}))(?!\\s+\\d{1,2}(?:${ordinalSuffix})?[,\\s]\\s*\\d{2,4})\\b`, "gi"),
  // Tháng số với text (ví dụ: month 1, month 12)
  /\b(month\s+(?:0?[1-9]|1[0-2]))\b/gi,
  // Tháng tiếng Việt (ví dụ: tháng một, tháng 12)
  /\b(tháng\s+(?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|mười một|mười hai|0?[1-9]|1[0-2]))\b/gi,
  // Tháng với "in" (ví dụ: in January, in tháng một)
  new RegExp(`\\b(?:in|vào)\\s+((${months}|${monthsShort}))(?!\\s+\\d{1,2}(?:${ordinalSuffix})?[,\\s]\\s*\\d{2,4})\\b`, "gi"),
  // Tháng với "of" (ví dụ: of January)
  new RegExp(`\\bof\\s+((${months}|${monthsShort}))(?!\\s+\\d{1,2}(?:${ordinalSuffix})?[,\\s]\\s*\\d{2,4})\\b`, "gi"),
  // Tháng số đơn (ví dụ: month 01, month 12) - nhưng không nếu là phần của date
  /\b(month\s+(?:0?[1-9]|1[0-2]))(?!\s*[-/]\s*\d)\b/gi,
  // Tháng tiếng Việt viết đầy đủ (ví dụ: tháng Giêng, tháng Chạp)
  /\b(tháng\s+(?:Giêng|Hai|Ba|Tư|Năm|Sáu|Bảy|Tám|Chín|Mười|Mười Một|Mười Hai|Chạp))\b/gi,
];

// Pattern cho năm (year) - mở rộng để bắt mọi loại pattern year
const yearPatterns = [
  // Năm 4 chữ số (ví dụ: 2025, 1990, 2000) - nhưng không nếu là phần của date pattern
  /\b((19|20)\d{2})(?!\s*[-/]\s*\d{1,2})\b/g,
  // Năm với text (ví dụ: year 2025, năm 2025)
  /\b(?:year|năm)\s+((?:19|20)?\d{2,4})\b/gi,
  // Năm với AD/BC/CE/BCE (ví dụ: 2025 AD, 500 BC)
  /\b((\d{1,4})\s*(?:AD|BC|CE|BCE|ad|bc|ce|bce))\b/gi,
  // Năm 2 chữ số với apostrophe (ví dụ: '25, '90)
  /\b([''](\d{2}))\b/g,
  // Năm 3 chữ số (ví dụ: 999, 100)
  /\b(([1-9]\d{2}))(?!\s*[-/]\s*\d{1,2})\b/g,
  // Năm với từ "in" (ví dụ: in 2025, in năm 2025)
  /\b(?:in|vào)\s+((?:19|20)?\d{2,4})\b/gi,
  // Năm với từ "of" (ví dụ: of 2025)
  /\bof\s+((?:19|20)?\d{2,4})\b/gi,
];

// Pattern cho số viết của ngày trong tháng (ordinal day numbers)
const ordinalDayPatterns = [
  // Tiếng Anh: first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth
  // eleventh, twelfth, thirteenth, fourteenth, fifteenth, sixteenth, seventeenth, eighteenth, nineteenth, twentieth
  // twenty-first, twenty-second, twenty-third, twenty-fourth, twenty-fifth, twenty-sixth, twenty-seventh, twenty-eighth, twenty-ninth, thirtieth, thirty-first
  /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first|twenty-second|twenty-third|twenty-fourth|twenty-fifth|twenty-sixth|twenty-seventh|twenty-eighth|twenty-ninth|thirtieth|thirty-first)\b/gi,
  // Tiếng Việt: một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười, mười một, mười hai, mười ba, mười bốn, mười lăm, mười sáu, mười bảy, mười tám, mười chín, hai mươi, hai mươi mốt, hai mươi hai, hai mươi ba, hai mươi tư, hai mươi lăm, hai mươi sáu, hai mươi bảy, hai mươi tám, hai mươi chín, ba mươi, ba mươi mốt
  /\b(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|mười một|mười hai|mười ba|mười bốn|mười lăm|mười sáu|mười bảy|mười tám|mười chín|hai mươi|hai mươi mốt|hai mươi hai|hai mươi ba|hai mươi tư|hai mươi lăm|hai mươi sáu|hai mươi bảy|hai mươi tám|hai mươi chín|ba mươi|ba mươi mốt)\b/gi,
  // Số thứ tự với "ngày" (ví dụ: ngày một, ngày hai mươi)
  /\bngày\s+(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|mười một|mười hai|mười ba|mười bốn|mười lăm|mười sáu|mười bảy|mười tám|mười chín|hai mươi|hai mươi mốt|hai mươi hai|hai mươi ba|hai mươi tư|hai mươi lăm|hai mươi sáu|hai mươi bảy|hai mươi tám|hai mươi chín|ba mươi|ba mươi mốt)\b/gi,
  // Số thứ tự với "the" (ví dụ: the first, the second)
  /\bthe\s+(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first|twenty-second|twenty-third|twenty-fourth|twenty-fifth|twenty-sixth|twenty-seventh|twenty-eighth|twenty-ninth|thirtieth|thirty-first)\b/gi,
  // Số thứ tự dạng số với suffix: 1st, 2nd, 3rd, 4th, ... 31st (cơ bản)
  /\b(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với dấu chấm: 1st., 2nd., 3rd., 4th.
  /\b(\d{1,2}(?:st|nd|rd|th)\.)\b/gi,
  // Số thứ tự với "the": the 1st, the 2nd, the 3rd
  /\bthe\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "on the": on the 1st, on the 2nd
  /\bon\s+the\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "of": 1st of, 2nd of (thường đi kèm với month)
  /\b(\d{1,2}(?:st|nd|rd|th))\s+of\b/gi,
  // Số thứ tự với "day": 1st day, 2nd day
  /\b(\d{1,2}(?:st|nd|rd|th))\s+day\b/gi,
  // Số thứ tự với "date": 1st date, 2nd date
  /\b(\d{1,2}(?:st|nd|rd|th))\s+date\b/gi,
  // Số thứ tự với "ngày": ngày 1st, ngày 2nd (ít gặp nhưng có thể có)
  /\bngày\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với dấu phẩy: 1st, 2nd, (trong danh sách)
  /\b(\d{1,2}(?:st|nd|rd|th))\s*,/gi,
  // Số thứ tự với khoảng trắng giữa số và suffix: 1 st, 2 nd (ít gặp)
  /\b(\d{1,2}\s+(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "on": on 1st, on 2nd
  /\bon\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "by": by 1st, by 2nd
  /\bby\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "until": until 1st, until 2nd
  /\buntil\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "from": from 1st, from 2nd
  /\bfrom\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "to": to 1st, to 2nd
  /\bto\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "before": before 1st, before 2nd
  /\bbefore\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "after": after 1st, after 2nd
  /\bafter\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "since": since 1st, since 2nd
  /\bsince\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "at": at 1st, at 2nd
  /\bat\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "till": till 1st, till 2nd
  /\btill\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "through": through 1st, through 2nd
  /\bthrough\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "đến": đến 1st (tiếng Việt)
  /\bđến\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "từ": từ 1st (tiếng Việt)
  /\btừ\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "vào": vào 1st (tiếng Việt)
  /\bvào\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với dấu ngoặc đơn: (1st), (2nd)
  /\((\d{1,2}(?:st|nd|rd|th))\)/gi,
  // Số thứ tự với dấu ngoặc vuông: [1st], [2nd]
  /\[(\d{1,2}(?:st|nd|rd|th))\]/gi,
  // Số thứ tự với "No.": No. 1st, No. 2nd
  /\bNo\.\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "number": number 1st, number 2nd
  /\bnumber\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "day of": day of 1st
  /\bday\s+of\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
  // Số thứ tự với "date of": date of 1st
  /\bdate\s+of\s+(\d{1,2}(?:st|nd|rd|th))\b/gi,
];

// Pattern cho số (numbers) - bắt mọi loại số
const numberPatterns = [
  // Số thập phân (ví dụ: 3.14, 0.5, 123.456)
  /\b(\d+\.\d+)\b/g,
  // Số nguyên với dấu phẩy phân cách hàng nghìn (ví dụ: 1,000, 10,000, 1,234,567)
  /\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\b/g,
  // Số nguyên lớn (ví dụ: 100, 1000, 12345)
  /\b(\d{3,})\b/g,
  // Số nguyên nhỏ (ví dụ: 0, 1, 2, 10, 99) - nhưng không nếu là phần của date/time
  /\b((?:0|[1-9]\d{0,2}))(?!\s*[-/:]\s*\d|\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.))\b/g,
  // Số âm (ví dụ: -5, -10.5, -1,234)
  /\b(-?\d+(?:,\d{3})*(?:\.\d+)?)\b/g,
  // Số với phần trăm (ví dụ: 50%, 100%)
  /\b(\d+(?:\.\d+)?%)\b/g,
  // Số với đơn vị tiền tệ (ví dụ: $100, €50, 100 USD, 50 VND)
  /\b([$€£¥]\s*\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:,\d{3})*(?:\.\d+)?\s*(?:USD|EUR|GBP|JPY|VND|đ))\b/gi,
];

const datePatterns = [
  // ISO 8601 format (ví dụ: 2025-11-06T14:30:00Z, 2025-11-06T14:30:00+05:30)
  /\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+\-]\d{2}:\d{2})?)\b/g,
  // RFC 2822 format (ví dụ: Mon, 06 Nov 2025 14:30:00 +0500)
  new RegExp(`\\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\\s+\\d{1,2}\\s+(${monthsShort})\\s+\\d{2,4}\\s+\\d{2}:\\d{2}(?::\\d{2})?\\s+[+\-]\\d{4}\\b`, "gi"),
  // YYYY-MM-DDTHH:MM:SS (datetime ISO without timezone)
  /\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)\b/g,
  // YYYY-MM-DD HH:MM:SS (datetime với space)
  /\b(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)\b/g,
  // DD/MM/YYYY HH:MM hoặc DD-MM-YYYY HH:MM hoặc DD.MM.YYYY HH:MM
  /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\s+\d{1,2}:\d{2}(?::\d{2})?)\b/g,
  // MM/DD/YYYY HH:MM (định dạng Mỹ với time)
  /\b(\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}(?::\d{2})?)\b/g,
  // DD/MM/YYYY hoặc DD-MM-YYYY hoặc DD.MM.YYYY
  /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/g,
  // MM/DD/YYYY (định dạng Mỹ)
  /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
  // YYYY-MM-DD (ISO format)
  /\b(\d{4}-\d{2}-\d{2})\b/g,
  // YYYY/MM/DD
  /\b(\d{4}\/\d{2}\/\d{2})\b/g,
  // DD-MM-YY hoặc DD/MM/YY
  /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})\b/g,
  // Weekday, Month Day, Year (ví dụ: Monday, November 6, 2025)
  new RegExp(`\\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\\s+(${months})\\s+\\d{1,2}(?:${ordinalSuffix})?,\\s+\\d{2,4}\\b`, "gi"),
  // Time Month Day, Year (ví dụ: 12:00 AM, November 6, 2025)
  new RegExp(`\\b(\\d{1,2}:\\d{2}\\s+(?:AM|PM|am|pm|a\\.m\\.|p\\.m\\.),\\s+(${months})\\s+\\d{1,2}(?:${ordinalSuffix})?,\\s+\\d{2,4})\\b`, "gi"),
  // Month Day, Year (ví dụ: November 6, 2025)
  new RegExp(`\\b((${months})\\s+\\d{1,2}(?:${ordinalSuffix})?,\\s+\\d{2,4})\\b`, "gi"),
  // Day Month Year (ví dụ: 6 November 2025)
  new RegExp(`\\b(\\d{1,2}(?:${ordinalSuffix})?\\s+(${months})\\s+\\d{2,4})\\b`, "gi"),
  // Month Day Year (ví dụ: November 6 2025)
  new RegExp(`\\b((${months})\\s+\\d{1,2}(?:${ordinalSuffix})?\\s+\\d{2,4})\\b`, "gi"),
  // Month Year (ví dụ: November 2025, Nov 2025)
  new RegExp(`\\b((${months}|${monthsShort})\\s+\\d{2,4})\\b`, "gi"),
  // Day Month (ví dụ: 6 November, 6 Nov)
  new RegExp(`\\b(\\d{1,2}(?:${ordinalSuffix})?\\s+(${months}|${monthsShort}))\\b`, "gi"),
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
  // Tháng MM năm YYYY (tiếng Việt)
  /\b(tháng\s+\d{1,2}\s+năm\s+\d{2,4})\b/gi,
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

// Highlight tất cả các pattern: tên, ngày tháng, tháng, và năm
// Chỉ sử dụng regex patterns
function highlightText(
  text: string,
  namesRx: RegExp | null
) {
  // Đảm bảo text hợp lệ - nếu không có text hoặc rỗng, trả về ngay
  if (!text || typeof text !== 'string' || text.length === 0) {
    return [text || ''];
  }

  type HighlightSpan = {
    start: number;
    end: number;
    type: "name" | "date" | "month" | "year" | "number" | "ordinalDay";
    content: string;
  };

  const highlights: HighlightSpan[] = [];

  // Thu thập highlights từ tên
  if (namesRx) {
    let match: RegExpExecArray | null;
    while ((match = namesRx.exec(text)) !== null) {
      // Kiểm tra overlap với highlights đã có
      const overlaps = highlights.some(
        (h) =>
          h.type === "name" &&
          !(match!.index + match![0].length <= h.start || match!.index >= h.end)
      );
      if (!overlaps) {
        highlights.push({
          start: match.index,
          end: match.index + match[0].length,
          type: "name",
          content: match[0],
        });
      }
    }
  }


  // Thu thập highlights từ ngày tháng (date) - ưu tiên cao nhất
  for (const pattern of datePatterns) {
    try {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        // Sử dụng match[0] (toàn bộ match) để đảm bảo lấy đúng text
        const matchedText = match[0] || match[1] || '';
        if (matchedText && match.index !== undefined && match.index >= 0) {
          // Kiểm tra overlap với highlights đã có
          const overlaps = highlights.some(
            (h) =>
              h.type === "date" &&
              !(match!.index + matchedText.length <= h.start || match!.index >= h.end)
          );
          if (!overlaps) {
            highlights.push({
              start: match.index,
              end: match.index + matchedText.length,
              type: "date",
              content: matchedText,
            });
          }
        }
      }
    } catch (e) {
      // Bỏ qua pattern lỗi, tiếp tục với pattern khác
      console.warn('Error processing date pattern:', e);
    }
  }

  // Thu thập highlights từ tháng (month) - chỉ khi đứng độc lập
  for (const pattern of monthPatterns) {
    try {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        // Sử dụng match[0] (toàn bộ match) hoặc match[1] (capture group đầu tiên)
        const matchedText = match[0] || match[1] || '';
        if (matchedText && match.index !== undefined && match.index >= 0) {
          // Kiểm tra overlap với highlights đã có
          const overlaps = highlights.some(
            (h) =>
              h.type === "month" &&
              !(match!.index + matchedText.length <= h.start || match!.index >= h.end)
          );
          if (!overlaps) {
            highlights.push({
              start: match.index,
              end: match.index + matchedText.length,
              type: "month",
              content: matchedText,
            });
          }
        }
      }
    } catch (e) {
      // Bỏ qua pattern lỗi, tiếp tục với pattern khác
      console.warn('Error processing month pattern:', e);
    }
  }

  // Thu thập highlights từ năm (year) - chỉ khi đứng độc lập
  for (const pattern of yearPatterns) {
    try {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        // Sử dụng match[0] (toàn bộ match) hoặc match[1] (capture group đầu tiên)
        const matchedText = match[0] || match[1] || '';
        if (matchedText && match.index !== undefined && match.index >= 0) {
          // Kiểm tra overlap với highlights đã có
          const overlaps = highlights.some(
            (h) =>
              h.type === "year" &&
              !(match!.index + matchedText.length <= h.start || match!.index >= h.end)
          );
          if (!overlaps) {
            highlights.push({
              start: match.index,
              end: match.index + matchedText.length,
              type: "year",
              content: matchedText,
            });
          }
        }
      }
    } catch (e) {
      // Bỏ qua pattern lỗi, tiếp tục với pattern khác
      console.warn('Error processing year pattern:', e);
    }
  }

  // Thu thập highlights từ số viết của ngày trong tháng (ordinal day numbers)
  for (const pattern of ordinalDayPatterns) {
    try {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        // Sử dụng match[0] (toàn bộ match) hoặc match[1] (capture group đầu tiên)
        const matchedText = match[0] || match[1] || '';
        if (matchedText && match.index !== undefined && match.index >= 0) {
          // Kiểm tra overlap với highlights đã có (tránh conflict với date/name)
          const overlaps = highlights.some(
            (h) =>
              (h.type === "date" || h.type === "name" || h.type === "ordinalDay") &&
              !(match!.index + matchedText.length <= h.start || match!.index >= h.end)
          );
          if (!overlaps) {
            highlights.push({
              start: match.index,
              end: match.index + matchedText.length,
              type: "ordinalDay",
              content: matchedText,
            });
          }
        }
      }
    } catch (e) {
      // Bỏ qua pattern lỗi, tiếp tục với pattern khác
      console.warn('Error processing ordinal day pattern:', e);
    }
  }

  // Thu thập highlights từ số (numbers) - ưu tiên thấp nhất để tránh conflict với date/time
  for (const pattern of numberPatterns) {
    try {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        // Sử dụng match[0] (toàn bộ match) hoặc match[1] (capture group đầu tiên)
        const matchedText = match[0] || match[1] || '';
        if (matchedText && match.index !== undefined && match.index >= 0) {
          // Kiểm tra overlap với highlights đã có (tránh highlight số nếu đã là phần của date)
          const overlaps = highlights.some(
            (h) =>
              (h.type === "date" || h.type === "number") &&
              !(match!.index + matchedText.length <= h.start || match!.index >= h.end)
          );
          if (!overlaps) {
            highlights.push({
              start: match.index,
              end: match.index + matchedText.length,
              type: "number",
              content: matchedText,
            });
          }
        }
      }
    } catch (e) {
      // Bỏ qua pattern lỗi, tiếp tục với pattern khác
      console.warn('Error processing number pattern:', e);
    }
  }

  // Sắp xếp theo priority trước (name > date > ordinalDay > month > year > number), sau đó theo độ dài (dài trước) để ưu tiên pattern dài hơn
  // Date có priority cao hơn month/year vì date pattern có thể chứa month/year và có nhiều thông tin hơn
  // OrdinalDay có priority cao hơn number vì nó là pattern cụ thể hơn
  // Number có priority thấp nhất để tránh conflict với các pattern khác
  const priority = { name: 0, date: 1, ordinalDay: 2, month: 3, year: 4, number: 5 };
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

  // Validate và filter các highlights hợp lệ (đảm bảo không làm mất text)
  const validHighlights = filtered.filter((h) => {
    return (
      h.start >= 0 &&
      h.end > h.start &&
      h.start < text.length &&
      h.end <= text.length &&
      h.end > h.start // Đảm bảo end > start
    );
  });

  // Tạo React nodes - đảm bảo toàn bộ text gốc được giữ nguyên, chỉ thêm thẻ span để highlight
  const out: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const h of validHighlights) {
    // Đảm bảo không có overlap với highlight trước đó (bỏ qua nếu overlap)
    if (h.start < lastIndex) {
      // Highlight này overlap với highlight trước, bỏ qua để tránh mất text
      continue;
    }

    // Thêm text trước highlight (phần chưa được highlight)
    if (lastIndex < h.start) {
      const beforeText = text.slice(lastIndex, h.start);
      if (beforeText) {
        out.push(beforeText);
      }
    }

    // Lấy text gốc từ vị trí start đến end (đảm bảo từ text gốc)
    const originalText = text.slice(Math.max(0, h.start), Math.min(text.length, h.end));
    
    // Chỉ thêm highlight nếu có text
    if (originalText && originalText.length > 0) {
      // Xác định class cho highlight
      let className = namePill;
      if (h.type === "date") className = datePill;
      else if (h.type === "month") className = monthPill;
      else if (h.type === "year") className = yearPill;
      else if (h.type === "number") className = numberPill;
      else if (h.type === "ordinalDay") className = ordinalDayPill;

      // Thêm thẻ span với text gốc (KHÔNG thay đổi nội dung text, chỉ thêm class để highlight)
      out.push(
        <span key={`${h.type}-${h.start}-${h.end}`} className={className}>
          {originalText}
        </span>
      );
    }

    // Cập nhật lastIndex để track vị trí đã xử lý
    lastIndex = Math.max(lastIndex, h.end);
  }

  // Thêm phần text còn lại sau highlight cuối cùng (QUAN TRỌNG: đảm bảo không mất text)
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      out.push(remainingText);
    }
  }

  // Nếu không có highlights nào hoặc không có gì trong out, trả về text gốc để đảm bảo không mất gì
  if (out.length === 0) {
    return [text];
  }

  // Đảm bảo luôn có ít nhất text gốc được render
  return out;
}

// Wrapper function với error handling để đảm bảo không bao giờ mất text gốc
function highlightTextSafe(
  text: string,
  namesRx: RegExp | null
): React.ReactNode[] {
  try {
    return highlightText(text, namesRx);
  } catch (error) {
    // Nếu có lỗi bất kỳ, trả về text gốc để đảm bảo không mất gì
    console.error('Error in highlightText:', error);
    return [text];
  }
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

            {/* Nội dung + highlight tên, ngày tháng, tháng, năm */}
            <span className="align-middle">
              {highlightTextSafe(line.text, namesRx)}
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