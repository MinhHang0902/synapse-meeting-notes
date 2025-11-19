"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Download,
  History,
  Trash2,
  FileText,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDeleteDialog from "../../confirm-dialog";
import MeetingTranscript from "./meeting-transcript";
import MeetingEditor, { ActionItem } from "./meeting-editor";
import { MeetingsApi } from "@/lib/api/meeting";
import { ProjectsApi } from "@/lib/api/project";
import type {
  GetOneMeetingMinuteResponse,
  UpdateMeetingMinuteRequest,
} from "@/types/interfaces/meeting";
import type { MemberProjectData } from "@/types/interfaces/project";
import axios from "axios";

function safeIsoSlice(input: unknown, sliceEnd: number): string {
  if (!input) return "";
  const d = new Date(input as any);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, sliceEnd);
}

function formatLocalDateTimeForInput(input: unknown): string {
  if (!input) return "";
  const d = new Date(input as any);
  if (Number.isNaN(d.getTime())) return "";
  
  // Kiểm tra xem date có phải là "date-only" (midnight UTC) không
  // Nếu có, dùng UTC methods để tránh lệch timezone
  const isDateOnly = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
  
  if (isDateOnly) {
    // Date-only: dùng UTC để tránh lệch ngày
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    // Set default time là 00:00 local
    return `${year}-${month}-${day}T00:00`;
  }
  
  // DateTime với time cụ thể: dùng local time
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatLocalDateForInput(input: unknown): string {
  if (!input) return "";
  
  // Nếu input là string dạng date-only (YYYY-MM-DD), parse trực tiếp
  if (typeof input === "string") {
    const dateOnlyMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
    if (dateOnlyMatch) {
      return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
    }
  }
  
  const d = new Date(input as any);
  if (Number.isNaN(d.getTime())) return "";
  
  // Sử dụng UTC methods để lấy date components từ ISO string
  // Điều này đảm bảo không bị lệch khi server trả về UTC date
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type EditorAttendee = { userId?: number; name: string; role: string };
type EditorActionItem = {
  id: string;
  description: string;
  assignee: string;
  assigneeId?: number; 
  dueDate: string; 
};

type TabKey = "transcript" | "mom";

export default function MinuteDetailPage({
  minuteId,
  locale,
}: {
  minuteId: string;
  locale: string;
}) {
  const router = useRouter();
  const q = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>("transcript");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<GetOneMeetingMinuteResponse | null>(null);
  const [projectMembers, setProjectMembers] = useState<MemberProjectData[]>([]);

  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(""); // datetime-local
  const [attendees, setAttendees] = useState<EditorAttendee[]>([]);
  const [actionItems, setActionItems] = useState<EditorActionItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const transcriptFallback = (() => {
    console.log(`[DEBUG] detail?.transcripts:`, detail?.transcripts);
    const firstTranscript = detail?.transcripts?.[0];
    console.log(`[DEBUG] firstTranscript:`, firstTranscript);
    if (!firstTranscript) {
      console.log(`[DEBUG] No firstTranscript found`);
      return [];
    }

    console.log(`[DEBUG] firstTranscript.segments:`, firstTranscript.segments);
    console.log(`[DEBUG] firstTranscript.segments?.length:`, firstTranscript.segments?.length);
    console.log(`[DEBUG] firstTranscript.raw_text length:`, firstTranscript.raw_text?.length);

    const result: Array<{ speaker: string; text: string }> = [];
    const seenTexts = new Set<string>(); 

    const normalizeForComparison = (text: string): string => {
      return text
        .replace(/\s+/g, ' ') 
        .trim()
        .toLowerCase();
    };

    // Helper: check xem text đã có trong segments chưa (fuzzy match)
    const isTextInSegments = (text: string): boolean => {
      const normalized = normalizeForComparison(text);
      if (seenTexts.has(normalized)) return true;
      
      // Check xem có phải là substring của text đã có không (hoặc ngược lại)
      const seenArray = Array.from(seenTexts);
      for (const seen of seenArray) {
        if (normalized.includes(seen) || seen.includes(normalized)) {
          // Nếu một trong hai là substring của cái kia và độ dài chênh lệch < 30%, coi như duplicate
          const lengthDiff = Math.abs(normalized.length - seen.length);
          const maxLength = Math.max(normalized.length, seen.length);
          if (maxLength > 0 && lengthDiff / maxLength < 0.3) {
            return true;
          }
        }
      }
      return false;
    };

    // ƯU TIÊN: Nếu có segments với speaker info, LẤY HẾT TẤT CẢ segments (không filter)
    if (firstTranscript.segments && firstTranscript.segments.length > 0) {
      console.log(`[DEBUG] Processing ${firstTranscript.segments.length} segments from diarization`);
      // LẤY HẾT TẤT CẢ segments, không bỏ sót bất kỳ segment nào
      const segmentLines = firstTranscript.segments.map((seg, index) => {
        // Parse "Speaker: text" format
        const match = seg.content.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const speaker = match[1].trim();
          const text = match[2].trim();
          const normalized = normalizeForComparison(text);
          // Luôn thêm segments vào (không check duplicate giữa các segments)
          // Mỗi segment là unique và cần được hiển thị
          seenTexts.add(normalized);
          console.log(`[DEBUG] Segment ${index + 1}: ${speaker} - ${text.substring(0, 50)}...`);
          return { speaker, text };
        }
        // Fallback if no colon format - có thể là text không có speaker
        const normalized = normalizeForComparison(seg.content);
        seenTexts.add(normalized);
        console.log(`[DEBUG] Segment ${index + 1}: Unknown format - ${seg.content.substring(0, 50)}...`);
        return { speaker: "Unknown", text: seg.content };
      });
      result.push(...segmentLines);
      console.log(`[DEBUG] Added ALL ${segmentLines.length} segments to result`);
    }

    if (firstTranscript.raw_text?.trim() && result.length === 0) {
      const rawTextTrimmed = firstTranscript.raw_text.trim();
      
      console.log(`[DEBUG] Processing raw_text (no segments), rawText length: ${rawTextTrimmed.length}`);
      
      // Chỉ thêm raw_text khi KHÔNG có segments
      if (rawTextTrimmed.length > 0) {
        // Nếu raw_text không có newlines (là một đoạn text dài), split by sentences
        let rawTextLines: string[];
        if (!rawTextTrimmed.includes('\n')) {
          // Split by sentences (period, question mark, exclamation mark)
          rawTextLines = rawTextTrimmed
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
          console.log(`[DEBUG] Split raw_text by sentences: ${rawTextLines.length} sentences`);
        } else {
          // Parse raw_text thành các dòng (split by newline)
          rawTextLines = rawTextTrimmed.split(/\n+/).filter(line => line.trim());
          console.log(`[DEBUG] Split raw_text by newlines: ${rawTextLines.length} lines`);
        }
        
        // Xử lý từng dòng/câu của raw_text (chỉ chạy khi không có segments)
        let addedCount = 0;
        for (const line of rawTextLines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          // Parse "Speaker: text" format
          const match = trimmedLine.match(/^([^:]+):\s*(.+)$/);
          if (match) {
            const speaker = match[1].trim();
            const text = match[2].trim();
            const normalized = normalizeForComparison(text);
            seenTexts.add(normalized);
            result.push({ speaker, text });
            addedCount++;
          } else {
            // Nếu không có format "Speaker: text", thêm như System
            const normalized = normalizeForComparison(trimmedLine);
            seenTexts.add(normalized);
            result.push({ speaker: "System", text: trimmedLine });
            addedCount++;
          }
        }
        console.log(`[DEBUG] Added ${addedCount} lines from raw_text`);
      }
    }

    // Nếu không có gì cả, trả về empty
    console.log(`[DEBUG] Final result: ${result.length} lines`);
    return result.length > 0 ? result : [];
  })();

  // Generate speakers object from transcript lines
  const transcriptSpeakers = (() => {
    const speakerColors = [
      "text-blue-600",
      "text-green-600", 
      "text-purple-600",
      "text-orange-600",
      "text-pink-600",
      "text-indigo-600",
      "text-teal-600",
      "text-red-600",
    ];
    
    const uniqueSpeakers = new Set(transcriptFallback.map(line => line.speaker));
    const speakers: Record<string, { name: string; color: string }> = {};
    
    Array.from(uniqueSpeakers).forEach((speaker, index) => {
      speakers[speaker] = {
        name: speaker,
        color: speakerColors[index % speakerColors.length],
      };
    });
    
    return speakers;
  })();

  /* ---------- Animated underline for tabs ---------- */
  function useTabIndicator() {
    const tabsWrapRef = useRef<HTMLDivElement | null>(null);
    const tabBtnRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
      transcript: null,
      mom: null,
    });
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });
    const recalc = () => {
      const wrap = tabsWrapRef.current;
      const el = tabBtnRefs.current[activeTab];
      if (!wrap || !el) return;
      const { left: l1 } = wrap.getBoundingClientRect();
      const { left: l2, width } = el.getBoundingClientRect();
      setIndicator({ left: l2 - l1, width });
    };
    useEffect(() => {
      recalc();
      window.addEventListener("resize", recalc);
      return () => window.removeEventListener("resize", recalc);
    }, [activeTab]);
    return { tabsWrapRef, tabBtnRefs, indicator };
  }
  const { tabsWrapRef, tabBtnRefs, indicator } = useTabIndicator();

  /* ---------- Fetch detail & project members ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await MeetingsApi.detail(Number(minuteId));
        setDetail(data);
        
        // Load project members
        if (data.project_id) {
          try {
            const projectDetail = await ProjectsApi.detail(data.project_id);
            setProjectMembers(projectDetail.project_membersAndRoles || []);
          } catch (e) {
            console.error("Failed to load project members:", e);
            setProjectMembers([]);
          }
        }

        // Title
        setMeetingTitle(data.title || "");

        // Date & Time: ưu tiên actual_start -> schedule_start -> created_at, hiển thị theo local (tránh lệch timezone)
        const rawDate = data.actual_start ?? data.schedule_start ?? data.created_at;
        const formatted = formatLocalDateTimeForInput(rawDate);
        setMeetingDate(formatted);

        // Load attendees từ participants (dữ liệu từ AI service)
        setAttendees(
          (data.participants || []).map((p) => ({
            userId: p.user?.user_id,
            name: p.user?.name || "",
            role: "", // User interface không có role field
          }))
        );

        // Action items seed cho UI (assigneeId nếu có)
        setActionItems(
          (data.actionItems || []).map((ai) => ({
            id: String(ai.action_id),
            description: ai.description || "",
            assignee: ai.assignee?.name || "",
            assigneeId: ai.assignee?.user_id, // NEW
            dueDate: formatLocalDateForInput(ai.due_date),
          }))
        );
      } catch (e) {
        console.error(e);
        setErr("Failed to load meeting detail.");
      } finally {
        setLoading(false);
      }
    };
    if (minuteId) load();
  }, [minuteId]);

  // ===== Handlers dùng UI types =====
  const removeAttendee = (index: number) =>
    setAttendees((s) => s.filter((_, i) => i !== index));

  const addAttendee = (userId: number, name: string, role: string = "") =>
    setAttendees((s) => [...s, { userId, name, role }]);

  const removeActionItem = (id: string) =>
    setActionItems((s) => s.filter((i) => i.id !== id));

  const updateActionItem = (
    id: string,
    field: keyof ActionItem,
    value: string | number
  ) =>
    setActionItems((s) =>
      s.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const addActionItem = () =>
    setActionItems((s) => [
      ...s,
      {
        id: `temp-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        description: "",
        assignee: "",
        dueDate: "",
      },
    ]);

  /* ---------- Save (API in parent) ---------- */
  type EditorDraft = {
    meetingTitle: string;
    meetingDate: string;
    attendees: { userId?: number; name: string; role?: string }[];
    actionItems: {
      id: string;
      description: string;
      assignee: string;
      assigneeId?: number;
      dueDate: string;
    }[];
    agenda: string; // textarea (multi-line)
    summary: string; // textarea
    decisions: string; // textarea (multi-line)
  };

  const handleSave = async (draft: EditorDraft) => {
    if (!detail) return;
    setSaving(true);
    setSaveError(null);

    // Map UI -> API
    const agendaArr = draft.agenda
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const decisionsArr = draft.decisions
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    // attendeeIds: CHỈ lấy id hợp lệ; nếu rỗng, KHÔNG gửi field này
    const attendeeIds = draft.attendees
      .map((a) => a.userId)
      .filter((id): id is number => typeof id === "number" && !Number.isNaN(id));
    const attendeeIdSet = new Set<number>(attendeeIds);

    // map tên -> userId từ attendees (fallback nếu action item không có assigneeId riêng)
    const nameToUserId = new Map<string, number>();
    draft.attendees.forEach((a) => {
      if (a.name && typeof a.userId === "number") {
        nameToUserId.set(a.name.trim(), a.userId);
      }
    });

    // action_items: ưu tiên assigneeId riêng; nếu không có thì mới thử map tên từ attendees
    const actionItemsApi = draft.actionItems
      .map((a) => {
        const desc = (a.description || "").trim();
        const isExisting = /^\d+$/.test(a.id);
        if (!desc && !isExisting) return null;

        let assigneeId: number | undefined =
          typeof a.assigneeId === "number" && !Number.isNaN(a.assigneeId)
            ? a.assigneeId
            : undefined;

        if (!assigneeId) {
          const name = (a.assignee || "").trim();
          assigneeId = name ? nameToUserId.get(name) : undefined;
        }

        if (!assigneeId) {
          const name = (a.assignee || "").trim();
          assigneeId = name ? nameToUserId.get(name) : undefined;
        }

        if (assigneeId) attendeeIdSet.add(assigneeId);

        const item: any = {};

        if (desc) {
          item.description = desc;
        } else if (!isExisting) {
          return null;
        }

        if (assigneeId !== undefined) {
          item.assigneeId = assigneeId;
        }

        if (isExisting) {
          item.id = Number(a.id);
        } else {
          item.status = "OPEN";
        }

        if (a.dueDate && a.dueDate.trim()) {
          // Parse date-only string (YYYY-MM-DD) thành UTC date để tránh lệch timezone
          const dateMatch = a.dueDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (dateMatch) {
            const [, year, month, day] = dateMatch;
            // Tạo Date object với UTC time để tránh timezone conversion
            const d = new Date(Date.UTC(
              parseInt(year, 10),
              parseInt(month, 10) - 1, // month is 0-indexed
              parseInt(day, 10)
            ));
            if (!Number.isNaN(d.getTime())) {
              item.due_date = d.toISOString();
            }
          } else {
            // Fallback: parse như bình thường nếu format không đúng
            const d = new Date(a.dueDate);
            if (!Number.isNaN(d.getTime())) item.due_date = d.toISOString();
          }
        }
        return item;
      })
      .filter(Boolean) as any[];

    let actualStartDate: Date;
    if (draft.meetingDate && !Number.isNaN(new Date(draft.meetingDate).getTime())) {
      actualStartDate = new Date(draft.meetingDate);
    } else if (detail.actual_start) {
      actualStartDate = new Date(detail.actual_start);
    } else if (detail.schedule_start) {
      actualStartDate = new Date(detail.schedule_start);
    } else {
      actualStartDate = new Date();
    }

    const payload: UpdateMeetingMinuteRequest = {
      title: draft.meetingTitle || detail.title,
      status: detail.status || "DRAFT",
      actual_start: actualStartDate.toISOString(), 
      agenda: agendaArr,
      meeting_summary: draft.summary || "",
      decisions: decisionsArr,
      attendeeIds: Array.from(attendeeIdSet),
      action_items: actionItemsApi,
    };

    try {
      console.log("=== DEBUG SAVE ===");
      console.log("minuteId:", Number(detail.minute_id));
      console.log("payload:", JSON.stringify(payload, null, 2));
      
      const updatedDetail = await MeetingsApi.update(
        Number(detail.minute_id),
        payload
      );
      // Cập nhật detail state với dữ liệu mới từ server
      setDetail(updatedDetail);
      
      // Đồng bộ lại UI state với dữ liệu mới từ server
      setMeetingTitle(updatedDetail.title || "");
      setMeetingDate(
        formatLocalDateTimeForInput(
          updatedDetail.actual_start ?? updatedDetail.schedule_start ?? updatedDetail.created_at
        )
      );
      
      setAttendees(
        (updatedDetail.participants || []).map((p) => ({
          userId: p.user?.user_id,
          name: p.user?.name || "",
          role: "", 
        }))
      );
      
      setActionItems(
        (updatedDetail.actionItems || []).map((ai) => ({
          id: String(ai.action_id),
          description: ai.description || "",
          assignee: ai.assignee?.name || "",
          assigneeId: ai.assignee?.user_id,
          dueDate: formatLocalDateForInput(ai.due_date),
        }))
      );
      
      setLastSavedAt(new Date());
    } catch (e: any) {
      console.error("PUT /meeting-minutes error:", e);
      if (axios.isAxiosError(e)) {
        console.error("=== ERROR DETAILS ===");
        console.error("Status:", e.response?.status);
        console.error("Response data:", e.response?.data);
        console.error("Request URL:", e.config?.url);
        console.error("Request method:", e.config?.method);
        console.error("Request data:", e.config?.data);
        
        const msg =
          e.response?.data?.message ||
          e.response?.data?.error ||
          e.response?.data?.detail ||
          e.message;
        setSaveError(`Save failed: ${msg}`);
      } else {
        setSaveError("Save failed: Unexpected error");
      }
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = () => {
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!minuteId) return;
    try {
      setDeleting(true);
      await MeetingsApi.remove(Number(minuteId));
      router.replace(`/${locale}/pages/meetings?deleted=true`);
    } catch (e) {
      console.error("Failed to delete meeting minute:", e);
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const updateBeforeSend = async () => {
    return;
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }
  if (err) {
    return <div className="p-6 text-sm text-red-600">{err}</div>;
  }
  if (!detail) return null;

  const initialAgendaStr = (detail.agenda || []).join("\n");
  const initialSummaryStr = detail.meeting_summary || detail.content || "";
  const initialDecisionsStr = (detail.decisions || [])
    .map((d) => d.statement)
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-8">
      <button
        className="inline-flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Meeting Minutes</span>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-600">
          {q.get("file") || detail.title}
        </span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {(q.get("file") || detail.title || "D")[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  {q.get("file") || detail.title}
                </h1>
                {/* <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" /> */}
              </div>
              <p className="text-sm text-gray-600">
                {detail?.project?.project_name || detail.project_id} • Uploaded{" "}
                {new Date(detail.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {activeTab === "mom" && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
            <b>Editor Mode:</b> You can edit MoM content and export files.
            Changes will be highlighted for tracking.
          </div>
        )}

        <div className="border-b border-gray-200 pt-2">
          <div ref={tabsWrapRef} className="relative flex gap-8">
            <span
              className="pointer-events-none absolute -bottom-px h-[2px] bg-black rounded-full"
              style={{
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
                transition:
                  "transform 260ms cubic-bezier(.22,.61,.36,1), width 260ms cubic-bezier(.22,.61,.36,1)",
              }}
            />
            <button
              ref={(el) => {
                tabBtnRefs.current.transcript = el;
              }}
              onClick={() => setActiveTab("transcript")}
              className={[
                "relative pb-3 px-1 inline-flex items-center gap-1.5 text-sm transition-colors",
                activeTab === "transcript"
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-800",
              ].join(" ")}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="font-medium">Transcript</span>
            </button>
            <button
              ref={(el) => {
                tabBtnRefs.current.mom = el;
              }}
              onClick={() => setActiveTab("mom")}
              className={[
                "relative pb-3 px-1 inline-flex items-center gap-1.5 text-sm transition-colors",
                activeTab === "mom"
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-800",
              ].join(" ")}
            >
              <NotebookPen className="w-3.5 h-3.5" />
              <span className="font-medium">MoM Editor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          {activeTab === "transcript" && (
            <MeetingTranscript
              lines={
                transcriptFallback.length
                  ? transcriptFallback
                  : [{ speaker: "System", text: "No transcript content." }]
              }
              speakers={
                Object.keys(transcriptSpeakers).length > 0
                  ? transcriptSpeakers
                  : { System: { name: "System", color: "text-blue-600" } }
              }
            />
          )}

          {activeTab === "mom" && (
            <>
              {saveError && (
                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}
              <MeetingEditor
                minuteId={Number(detail.minute_id)}
                meetingTitle={meetingTitle}
                meetingDate={meetingDate}
                attendees={attendees}
                actionItems={actionItems}
                projectMembers={projectMembers}
                onChangeTitle={setMeetingTitle}
                onChangeDate={setMeetingDate}
                onAddAttendee={addAttendee}
                onRemoveAttendee={removeAttendee}
                onUpdateActionItem={updateActionItem}
                onRemoveActionItem={removeActionItem}
                onAddActionItem={addActionItem}
                onBeforeSend={updateBeforeSend}
                onSave={handleSave}
                saving={saving}
                lastSavedAt={lastSavedAt || undefined}
                initialAgenda={initialAgendaStr}
                initialSummary={initialSummaryStr}
                initialDecisions={initialDecisionsStr}
              />
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              File Information
            </h3>

            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between">
                <dt className="text-gray-600">Title</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {detail.title}
                </dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="text-gray-600">Project Name</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {detail.project?.project_name ?? detail.project_id}
                </dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="text-gray-600">Created By</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {detail.createdBy?.name ?? detail.created_by}
                </dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="text-gray-600">Created At</dt>
                <dd className="text-right">
                  <div className="font-medium text-gray-900">
                    {new Date(detail.created_at).toLocaleString()}
                  </div>
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Status</dt>
                <dd className="text-right">
                  <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    {detail.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              <Button
                onClick={async () => {
                  try {
                    const { url } = await MeetingsApi.getDownloadUrl(Number(detail.minute_id));
                    if (!url) return;
                    window.open(url, "_blank", "noopener,noreferrer");
                  } catch (e) {
                    console.error("Download failed:", e);
                    alert("Không thể tải tệp: vui lòng thử lại sau.");
                  }
                }}
                className="w-full justify-start gap-3 h-10 bg-white text-gray-700 border border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200 font-medium group"
                variant="outline"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Download Original Transcript
              </Button>

              <Button
                className="w-full justify-start gap-3 h-10 bg-white text-gray-700 border border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200 font-medium group"
                variant="outline"
              >
                <History className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                View Version History
              </Button>

              <Button
                onClick={requestDelete}
                className="w-full justify-start gap-3 h-10 bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 font-medium group"
                variant="outline"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Delete File
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Warning"
        description={
          detail?.title
            ? `Do you really want to delete this meeting minute "${detail.title}"? This action cannot be undone.`
            : "Do you really want to delete this meeting minute? This action cannot be undone."
        }
        cancelText="Cancel"
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
