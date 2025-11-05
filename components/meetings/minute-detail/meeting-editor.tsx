// components/meeting/meeting-editor.tsx
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

type Props = {
  minuteId: number;

  meetingTitle: string;
  meetingDate: string;
  attendees: Attendee[];
  actionItems: ActionItem[];

  onChangeTitle: (v: string) => void;
  onChangeDate: (v: string) => void;

  onAddAttendee: (name: string) => void;
  onRemoveAttendee: (index: number) => void;

  onUpdateActionItem: (id: string, field: keyof ActionItem, value: string) => void;
  onRemoveActionItem: (id: string) => void;
  onAddActionItem: () => void;

  /** chạy trước khi modal gửi email thực hiện send */
  onBeforeSend?: () => Promise<void> | void;

  /** Save callback do parent handle API */
  onSave?: (draft: EditorDraft) => Promise<void> | void;
  saving?: boolean;
  lastSavedAt?: Date;

  /** NEW: seed từ API (cha truyền xuống) */
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
  const [attendeeInput, setAttendeeInput] = React.useState("");
  const [sendOpen, setSendOpen] = React.useState(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // Local editable contents (khởi tạo từ props thay vì hard-code)
  const [agenda, setAgenda] = React.useState(initialAgenda ?? "");
  const [summary, setSummary] = React.useState(initialSummary ?? "");
  const [decisions, setDecisions] = React.useState(initialDecisions ?? "");

  // khi props seed thay đổi (sau khi fetch), đồng bộ vào state
  React.useEffect(() => {
    setAgenda(initialAgenda ?? "");
  }, [initialAgenda]);

  React.useEffect(() => {
    setSummary(initialSummary ?? "");
  }, [initialSummary]);

  React.useEffect(() => {
    setDecisions(initialDecisions ?? "");
  }, [initialDecisions]);

  const handleAddAttendee = () => {
    const name = attendeeInput.trim();
    if (!name) return;
    onAddAttendee(name);
    setAttendeeInput("");
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
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

        {/* Save button */}
        <Button
          className="gap-2 bg-black text-white hover:bg-black/90 flex-shrink-0"
          onClick={emitSave}
          disabled={!!saving}
          title="Save changes"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </Button>

        {/* Saved indicator */}
        {lastSavedAt && !saving && (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved just now
          </div>
        )}

        <div className="flex-1" />

        <Button className="gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200 flex-shrink-0">
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
        <Button className="gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200 flex-shrink-0">
          <NotebookPen className="w-4 h-4" />
          Export Word
        </Button>
        <Button
          className="gap-2 bg-gray-900 text-white hover:bg-black flex-shrink-0"
          onClick={async () => {
            if (onSave) await emitSave();
            if (onBeforeSend) await onBeforeSend();
            setSendOpen(true);
          }}
        >
          <Mail className="w-4 h-4" />
          Send Email
        </Button>
      </div>

      {/* Meeting Title */}
      <div className="space-y-1.5">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <Type className="w-4 h-4" />
          Meeting Title
        </label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full px-4 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Date & Time */}
      <div className="space-y-1.5">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <CalendarClock className="w-4 h-4" />
          Date & Time
        </label>
        <div className="relative">
          <input
            ref={dateInputRef}
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full px-4 py-2 pr-10 text-sm bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
          <Users2 className="w-4 h-4" />
          Attendees
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
        <input
          type="text"
          placeholder="Add attendee name…"
          value={attendeeInput}
          onChange={(e) => setAttendeeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddAttendee()}
          className="w-full px-4 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
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
          className="w-full min-h-28 resize-y px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Divider */}
      <div className="-mx-6 border-t border-gray-200"></div>

      {/* Summary */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Meeting Summary</h3>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Divider */}
      <div className="-mx-6 border-t border-gray-200"></div>

      {/* Decisions */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Gavel className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Key Decisions</h3>
        </div>
        <textarea
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Divider */}
      <div className="-mx-6 border-t border-gray-200"></div>

      {/* Action Items */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          <label className="font-semibold text-gray-900 text-sm">Action Items</label>
        </div>

        <div className="space-y-2">
          {actionItems.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              onUpdateActionItem={onUpdateActionItem}
              onRemoveActionItem={onRemoveActionItem}
            />
          ))}
        </div>

        <div>
          <Button onClick={onAddActionItem} className="bg-black text-white hover:bg-black/90 gap-2">
            <Plus className="w-4 h-4" />
            Add Action Item
          </Button>
        </div>
      </div>

      {/* Modal gửi email */}
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
  onUpdateActionItem,
  onRemoveActionItem,
}: {
  item: ActionItem;
  onUpdateActionItem: (id: string, field: keyof ActionItem, value: string) => void;
  onRemoveActionItem: (id: string) => void;
}) {
  const dueDateInputRef = React.useRef<HTMLInputElement>(null);
  const handleDueDateCalendarClick = () => {
    if (dueDateInputRef.current) {
      dueDateInputRef.current.showPicker();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center p-3 border border-gray-200 rounded bg-white">
      <div className="col-span-12 md:col-span-6">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdateActionItem(item.id, "description", e.target.value)}
          placeholder="Enter action item description..."
          className="w-full text-sm px-2 py-1 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      <div className="col-span-6 md:col-span-3">
        <input
          type="text"
          value={item.assignee}
          onChange={(e) => onUpdateActionItem(item.id, "assignee", e.target.value)}
          placeholder="Assignee"
          className="w-full text-sm px-2 py-1 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      <div className="col-span-5 md:col-span-2">
        <div className="relative">
          <input
            ref={dueDateInputRef}
            type="date"
            value={item.dueDate}
            onChange={(e) => onUpdateActionItem(item.id, "dueDate", e.target.value)}
            className="w-full text-sm px-2 py-1 pr-7 bg-white text-gray-900 border border-gray-200 rounded focus:outline-none focus:border-gray-400 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-7 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
