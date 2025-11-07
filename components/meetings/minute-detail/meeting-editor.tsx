"use client";

import * as React from "react";
import {
  FileText,
  NotebookPen,
  Plus,
  Trash2,
  X,
  ListTodo,
  StickyNote,
  Gavel,
  Type,
  CalendarClock,
  Users2,
  CheckSquare,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SendMinuteModal from "./send-minute-modal";

export type ActionItem = {
  id: string;
  description: string;
  assignee: string;
  assigneeId?: number; // NEW: cho phép assign người ngoài attendees
  dueDate: string;
};
export type Attendee = { name: string; role?: string; userId?: number };

type EditorDraft = {
  meetingTitle: string;
  meetingDate: string;
  attendees: Attendee[];
  actionItems: ActionItem[];
  agenda: string;
  summary: string;
  decisions: string;
};

type ProjectMember = {
  user: {
    user_id: number;
    name: string;
    email: string;
  };
  projectRole: {
    project_role_id: number;
    role_type: string;
  };
};

type Props = {
  minuteId: number;
  meetingTitle: string;
  meetingDate: string;
  attendees: Attendee[];
  actionItems: ActionItem[];
  projectMembers: ProjectMember[];

  onChangeTitle: (v: string) => void;
  onChangeDate: (v: string) => void;
  onAddAttendee: (userId: number, name: string, role?: string) => void;
  onRemoveAttendee: (index: number) => void;
  onUpdateActionItem: (id: string, field: keyof ActionItem, value: string | number) => void;
  onRemoveActionItem: (id: string) => void;
  onAddActionItem: () => void;

  onBeforeSend?: () => Promise<void> | void;
  onSave?: (draft: EditorDraft) => Promise<void> | void;
  saving?: boolean;
  lastSavedAt?: Date;

  /** seed ban đầu từ API, chỉ dùng 1 lần */
  initialAgenda?: string;
  initialSummary?: string;
  initialDecisions?: string;

  className?: string;
};

export default function MeetingEditor({
  minuteId,
  meetingTitle,
  meetingDate,
  attendees,
  actionItems,
  projectMembers,
  onChangeTitle,
  onChangeDate,
  onAddAttendee,
  onRemoveAttendee,
  onUpdateActionItem,
  onRemoveActionItem,
  onAddActionItem,
  onBeforeSend,
  onSave,
  saving,
  lastSavedAt,
  initialAgenda,
  initialSummary,
  initialDecisions,
  className,
}: Props) {
  const [selectedAttendeeId, setSelectedAttendeeId] = React.useState<number | "">("");
  const [sendOpen, setSendOpen] = React.useState(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const formatDateTimeLocal = (v: string) => {
    if (!v) return "";
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return v;
      return d.toLocaleString();
    } catch {
      return v;
    }
  };

  const buildExportHtml = () => {
    const safe = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
    const attendeesHtml = attendees
      .map((a) => `<li>${safe(a.name)}${a.role ? ` (${safe(a.role)})` : ""}</li>`)
      .join("");
    const actionItemsHtml = actionItems
      .map(
        (ai) =>
          `<tr><td>${safe(ai.description)}</td><td>${safe(ai.assignee)}</td><td>${safe(ai.dueDate)}</td></tr>`
      )
      .join("");
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safe(meetingTitle || "Meeting Minutes")}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }
    h1 { font-size: 20px; margin: 0 0 12px; }
    h2 { font-size: 16px; margin: 18px 0 8px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
    th { background: #f5f5f5; text-align: left; }
    ul { margin: 0; padding-left: 18px; }
    .meta { color: #555; margin-bottom: 16px; font-size: 12px; }
    .section { margin-bottom: 16px; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <h1>${safe(meetingTitle || "Meeting Minutes")}</h1>
  <div class="meta">
    <div><b>Date & Time:</b> ${safe(formatDateTimeLocal(meetingDate))}</div>
    <div><b>Minute ID:</b> <span class="mono">${String(minuteId)}</span></div>
  </div>

  <div class="section">
    <h2>Attendees</h2>
    <ul>${attendeesHtml || "<li>None</li>"}</ul>
  </div>

  <div class="section">
    <h2>Agenda</h2>
    <div>${safe(agenda)}</div>
  </div>

  <div class="section">
    <h2>Meeting Summary</h2>
    <div>${safe(summary)}</div>
  </div>

  <div class="section">
    <h2>Key Decisions</h2>
    <div>${safe(decisions)}</div>
  </div>

  <div class="section">
    <h2>Action Items</h2>
    <table>
      <thead>
        <tr><th>Description</th><th>Assignee</th><th>Due Date</th></tr>
      </thead>
      <tbody>
        ${actionItemsHtml || `<tr><td colspan="3">None</td></tr>`}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  };

  const downloadWord = () => {
    const html = buildExportHtml();
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = (meetingTitle || "meeting-minutes").replace(/[^a-z0-9-_]+/gi, "_");
    a.href = url;
    a.download = `${baseName}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    // Mở cửa sổ in để người dùng "Save as PDF"
    const html = buildExportHtml();
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    // đợi layout
    setTimeout(() => {
      w.focus();
      w.print();
    }, 300);
  };

  // --- Local editable text, khởi tạo một lần duy nhất khi nhận seed ---
  const [agenda, setAgenda] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [decisions, setDecisions] = React.useState("");

  React.useEffect(() => {
    // chỉ seed 1 lần khi component mount, tránh overwrite khi user đang nhập
    setAgenda(initialAgenda ?? "");
    setSummary(initialSummary ?? "");
    setDecisions(initialDecisions ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddAttendee = () => {
    if (!selectedAttendeeId) return;
    const selected = projectMembers.find((m) => m.user.user_id === selectedAttendeeId);
    if (!selected) return;
    
    // Kiểm tra xem user đã được thêm chưa
    const alreadyAdded = attendees.some((a) => a.userId === selected.user.user_id);
    if (alreadyAdded) {
      setSelectedAttendeeId("");
      return;
    }
    
    onAddAttendee(selected.user.user_id, selected.user.name, selected.projectRole.role_type);
    setSelectedAttendeeId("");
  };

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker?.();
  };

  const emitSave = async () => {
    if (!onSave) return;
    const draft: EditorDraft = {
      meetingTitle,
      meetingDate,
      attendees,
      actionItems,
      agenda,
      summary,
      decisions,
    };
    await onSave(draft);
  };

  return (
    <div className={["space-y-6", className || ""].join(" ")}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 -mx-6 px-6">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-600 whitespace-nowrap">Template:</span>
          <select className="px-3 py-2 pr-8 border border-gray-300 rounded text-sm bg-white w-[160px] truncate appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20width%3d%2712%27%20height%3d%278%27%20viewBox%3d%270%200%2012%208%27%20fill%3d%27none%27%20xmlns%3d%27http%3a%2f%2fwww.w3.org%2f2000%2fsvg%27%3e%3cpath%20d%3d%27M1%201.5L6%206.5L11%201.5%27%20stroke%3d%27%23666%27%20stroke-width%3d%271.5%27%20stroke-linecap%3d%27round%27%20stroke-linejoin%3d%27round%27%2f%3e%3c%2fsvg%3e')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat">
            <option>Default Meeting Template</option>
          </select>
        </div>

        <Button
          className="gap-2 bg-black text-white hover:bg-black/90 flex-shrink-0"
          onClick={emitSave}
          disabled={!!saving}
          title="Save changes"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save
            </>
          )}
        </Button>

        {lastSavedAt && !saving && (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved just now
          </div>
        )}

        <div className="flex-1" />

        <Button className="gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200 flex-shrink-0" onClick={exportPdf}>
          <FileText className="w-4 h-4" /> Export PDF
        </Button>
        <Button className="gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200 flex-shrink-0" onClick={downloadWord}>
          <NotebookPen className="w-4 h-4" /> Export Word
        </Button>
        <Button
          className="gap-2 bg-gray-900 text-white hover:bg-black flex-shrink-0"
          onClick={async () => {
            if (onSave) await emitSave();
            if (onBeforeSend) await onBeforeSend();
            setSendOpen(true);
          }}
        >
          <Mail className="w-4 h-4" /> Send Email
        </Button>
      </div>

      {/* Meeting Title */}
      <div className="space-y-1.5">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <Type className="w-4 h-4" /> Meeting Title
        </label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400"
        />
      </div>

      {/* Date & Time */}
      <div className="space-y-1.5">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <CalendarClock className="w-4 h-4" /> Date & Time
        </label>
        <div className="relative">
          <input
            ref={dateInputRef}
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full px-4 py-2 pr-10 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
          <button
            type="button"
            onClick={handleCalendarClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 pointer-events-none"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Attendees */}
      <div className="space-y-2">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <Users2 className="w-4 h-4" /> Attendees
        </label>
        <div className="flex flex-wrap gap-2">
          {attendees.map((a, i) => (
            <div
              key={`${a.name}-${i}`}
              className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2 text-sm"
            >
              <span className="text-gray-900">
                {a.name} {a.role && `(${a.role})`}
              </span>
              <button
                onClick={() => onRemoveAttendee(i)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={selectedAttendeeId}
            onChange={(e) => setSelectedAttendeeId(e.target.value ? Number(e.target.value) : "")}
            className="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400"
          >
            <option value="">Select member to add...</option>
            {projectMembers
              .filter((m) => !attendees.some((a) => a.userId === m.user.user_id))
              .map((member) => (
                <option key={member.user.user_id} value={member.user.user_id}>
                  {member.user.name} ({member.user.email}) - {member.projectRole.role_type}
                </option>
              ))}
          </select>
          <Button
            onClick={handleAddAttendee}
            disabled={!selectedAttendeeId}
            className="px-4 bg-black text-white hover:bg-black/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="-mx-6 border-t border-gray-200"></div>

      {/* Agenda */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ListTodo className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Agenda</h3>
        </div>
        <textarea
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400"
        />
      </div>

      {/* Summary */}
      <div>
        <div className="flex items-center gap-2 mb-2 mt-4">
          <StickyNote className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Meeting Summary</h3>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400"
        />
      </div>

      {/* Decisions */}
      <div>
        <div className="flex items-center gap-2 mb-2 mt-4">
          <Gavel className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Key Decisions</h3>
        </div>
        <textarea
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400"
        />
      </div>

      {/* Action Items */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          <label className="font-semibold text-gray-900 text-sm">Action Items</label>
        </div>

        <div className="space-y-2">
          {actionItems.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              projectMembers={projectMembers}
              onUpdateActionItem={onUpdateActionItem}
              onRemoveActionItem={onRemoveActionItem}
            />
          ))}
        </div>

        <div>
          <Button
            onClick={onAddActionItem}
            className="bg-black text-white hover:bg-black/90 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Action Item
          </Button>
        </div>
      </div>

      <SendMinuteModal
        isOpen={sendOpen}
        onClose={() => setSendOpen(false)}
        meetingTitle={meetingTitle}
        minuteId={minuteId}
      />
    </div>
  );
}

/* Action Item Row */
function ActionItemRow({
  item,
  projectMembers,
  onUpdateActionItem,
  onRemoveActionItem,
}: {
  item: ActionItem;
  projectMembers: ProjectMember[];
  onUpdateActionItem: (id: string, field: keyof ActionItem, value: string | number) => void;
  onRemoveActionItem: (id: string) => void;
}) {
  const dueDateInputRef = React.useRef<HTMLInputElement>(null);
  const handleDueDateCalendarClick = () => {
    dueDateInputRef.current?.showPicker?.();
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center p-3 border border-gray-200 rounded bg-white">
      <div className="col-span-12 md:col-span-6">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdateActionItem(item.id, "description", e.target.value)}
          placeholder="Enter action item description..."
          className="w-full text-sm px-2 py-1 bg-white border border-gray-200 rounded focus:border-gray-400"
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <select
          value={item.assigneeId || ""}
          onChange={(e) => {
            const userId = Number(e.target.value);
            const selectedMember = projectMembers.find((m) => m.user.user_id === userId);
            if (selectedMember) {
              // Cập nhật cả assigneeId và assignee (name)
              onUpdateActionItem(item.id, "assigneeId", userId);
              onUpdateActionItem(item.id, "assignee", selectedMember.user.name);
            }
          }}
          className="w-full text-sm px-2 py-1 bg-white border border-gray-200 rounded focus:border-gray-400 appearance-auto"
        >
          <option value="">Select assignee...</option>
          {projectMembers.map((member) => (
            <option key={member.user.user_id} value={member.user.user_id}>
              {member.user.name} ({member.user.email})
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-5 md:col-span-2">
        <div className="relative">
          <input
            ref={dueDateInputRef}
            type="date"
            value={item.dueDate}
            onChange={(e) => onUpdateActionItem(item.id, "dueDate", e.target.value)}
            className="w-full text-sm px-2 py-1 pr-7 bg-white border border-gray-200 rounded focus:border-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
          <button
            type="button"
            onClick={handleDueDateCalendarClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 pointer-events-none"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <button
          onClick={() => onRemoveActionItem(item.id)}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove action item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
