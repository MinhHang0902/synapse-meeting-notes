// components/meeting/meeting-detail/page.tsx
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
import MeetingTranscript from "./meeting-transcript";
import MeetingEditor from "./meeting-editor";
import { MeetingsApi } from "@/lib/api/meeting";
import type {
  GetOneMeetingMinuteResponse,
  UpdateMeetingMinuteRequest,
} from "@/types/interfaces/meeting";

/** ==== UI types dành riêng cho editor (không dùng type API) ==== */
type EditorAttendee = { userId?: number; name: string; role: string };
type EditorActionItem = {
  id: string;
  description: string;
  assignee: string;
  dueDate: string; // "YYYY-MM-DD"
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

  // Editor state (UI schema)
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(""); // datetime-local
  const [attendees, setAttendees] = useState<EditorAttendee[]>([]);
  const [actionItems, setActionItems] = useState<EditorActionItem[]>([]);

  // Save UI state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // transcript tạm (nếu backend có content dạng plain)
  const transcriptFallback =
    detail?.content?.trim() ? [{ speaker: "System", text: detail.content }] : [];

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

  /* ---------- Fetch detail ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await MeetingsApi.detail(Number(minuteId));
        setDetail(data);

        // Title
        setMeetingTitle(data.title || "");

        // Date: ưu tiên actual_start
        setMeetingDate(
          data.actual_start ? new Date(data.actual_start).toISOString().slice(0, 16) : ""
        );

        // Attendees từ participants
        setAttendees(
          (data.participants || []).map((p) => ({
            userId: p.user?.user_id,
            name: p.user?.name || "",
            role: "",
          }))
        );

        // Action items
        setActionItems(
          (data.actionItems || []).map((ai) => ({
            id: String(ai.action_id),
            description: ai.description || "",
            assignee: ai.assignee?.name || "",
            dueDate: ai.due_date ? new Date(ai.due_date).toISOString().slice(0, 10) : "",
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

  const addAttendee = (name: string) =>
    setAttendees((s) => [...s, { name, role: "" }]);

  const removeActionItem = (id: string) =>
    setActionItems((s) => s.filter((i) => i.id === undefined || i.id !== id));

  const updateActionItem = (
    id: string,
    field: keyof EditorActionItem,
    value: string
  ) =>
    setActionItems((s) =>
      s.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const addActionItem = () =>
    setActionItems((s) => [
      ...s,
      {
        id: (Math.max(0, ...s.map((x) => Number(x.id))) + 1).toString(),
        description: "New action item",
        assignee: "",
        dueDate: "",
      },
    ]);

  /* ---------- Save (API in parent) ---------- */
  type EditorDraft = {
    meetingTitle: string;
    meetingDate: string;
    attendees: { userId?: number; name: string; role?: string }[];
    actionItems: { id: string; description: string; assignee: string; dueDate: string }[];
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

    const attendeeIds = draft.attendees
      .map((a) => a.userId)
      .filter((id): id is number => typeof id === "number");

    const actionItemsApi = draft.actionItems.map((a) => ({
      id: a.id ? Number(a.id) : undefined,
      description: a.description,
      assigneeId: 0, // TODO: map tên -> id khi backend cung cấp danh sách user
      due_date: a.dueDate ? new Date(a.dueDate) : new Date(),
      status: "OPEN",
      completed_at: undefined,
    }));

    const payload: UpdateMeetingMinuteRequest = {
      title: draft.meetingTitle || detail.title,
      status: detail.status || "DRAFT",
      actual_start: draft.meetingDate
        ? new Date(draft.meetingDate)
        : detail.actual_start || detail.schedule_start || new Date(),
      attendeeIds,
      agenda: agendaArr,
      meeting_summary: draft.summary || "",
      decisions: decisionsArr,
      action_items: actionItemsApi,
    };

    try {
      await MeetingsApi.update(Number(detail.minute_id), payload);
      setLastSavedAt(new Date());
    } catch (e) {
      console.error(e);
      setSaveError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async () => {
    if (!minuteId) return;
    if (!confirm("Delete this meeting minute?")) return;
    try {
      await MeetingsApi.remove(Number(minuteId));
      router.back();
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  /** Cập nhật MoM trước khi gửi email (tùy chọn) */
  const updateBeforeSend = async () => {
    if (!detail) return;
    const payload: UpdateMeetingMinuteRequest = {
      title: meetingTitle || detail.title,
      status: detail.status || "DRAFT",
      actual_start: detail.actual_start || detail.schedule_start || new Date(),
      attendeeIds: attendees
        .map((a) => a.userId)
        .filter((id): id is number => typeof id === "number"),
      agenda: (detail.agenda as any) || [],
      meeting_summary: "",
      decisions: [],
      action_items: [],
    };
    try {
      await MeetingsApi.update(Number(detail.minute_id), payload);
    } catch {
      // không chặn gửi email nếu update fail
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }
  if (err) {
    return <div className="p-6 text-sm text-red-600">{err}</div>;
  }
  if (!detail) return null;

  // Chuỗi seed cho editor
  const initialAgendaStr = (detail.agenda || []).join("\n");
  // Không có field meeting_summary trong response — dùng content làm summary fallback
  const initialSummaryStr = detail.content || "";
  const initialDecisionsStr = (detail.decisions || [])
    .map((d) => d.statement)
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
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

      {/* Header card */}
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
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          {activeTab === "transcript" && (
            <MeetingTranscript
              lines={
                transcriptFallback.length
                  ? transcriptFallback
                  : [{ speaker: "System", text: "No transcript content." }]
              }
              speakers={{ System: { name: "System", color: "text-blue-600" } }}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Information */}
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

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              <Button
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
                onClick={handleDelete}
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
    </div>
  );
}
