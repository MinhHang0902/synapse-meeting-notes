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
  Type as TitleIcon,
  CalendarClock,
  Users2,
  CheckSquare,
  UserCircle2,
  CalendarDays,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionItem, Attendee } from "@/types/interfaces/meeting";

/* =========================
   Modal: SendMinuteModal
   ========================= */

function SendMinuteModal({
  isOpen,
  onClose,
  fileName = "Q3_Financial_Report.pdf",
  projectName = "Digital Transformation Initiative",
  meetingTitle = "Q3 Financial Review",
}: {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  projectName?: string;
  meetingTitle?: string;
}) {
  const [sendToAll, setSendToAll] = React.useState(true);
  const [subject, setSubject] = React.useState(
    `Meeting Minutes: ${meetingTitle} – ${projectName}`
  );
  const [message, setMessage] = React.useState(
    `Hi team,

Please find attached the meeting minutes from our ${meetingTitle} session held on September 21, 2025.

Key highlights from the meeting:
• Q3 performance exceeded expectations with 15% cost savings
• Cloud migration progressing well (80% complete)
• User engagement increased by 25%`
  );

  const handleSendEmail = () => {
    console.log("Sending email with:", { sendToAll, subject, message, fileName });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal role="dialog">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header – match CreateProjectModal */}
        <div className="bg-black text-white p-6 flex items-start justify-between sticky top-0 z-20 rounded-t-2xl border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Send Meeting Minute</h2>
            </div>
            <p className="text-white/70 text-sm">
              Share MoM with project members via email
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Recipients */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              Recipients
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                id="sendToAll"
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="sendToAll" className="flex items-center gap-2 cursor-pointer">
                <span className="flex items-center gap-2">👥 Send to all project members</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  4 people
                </span>
              </label>
            </div>
            <p className="text-sm text-gray-500">Recipients are based on the Members list in Project.</p>
          </div>

          {/* Subject */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Message */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-32 text-sm"
            />
            <p className="text-sm text-gray-500 mt-2">
              The current MoM content will be exported and attached automatically.
            </p>
          </div>

          {/* Attachment */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-3">
              Attachment
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
              <div className="flex justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">MoM document will be automatically attached</p>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">
                    {fileName.replace(".pdf", "_MoM.pdf")}
                  </p>
                  <p className="text-xs text-gray-600">Generated from current MoM content</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer – match CreateProjectModal */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <Button onClick={onClose} variant="outline" className="px-6 bg-transparent">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSendEmail} className="bg-black hover:bg-black/90 px-6 text-white">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>
    </div>
  );
}


/* =========================
   Meeting Editor (main)
   ========================= */
type Props = {
  meetingTitle: string;
  meetingDate: string;
  attendees: Attendee[];
  actionItems: ActionItem[];

  onChangeTitle: (v: string) => void;
  onChangeDate: (v: string) => void;

  onAddAttendee: (name: string) => void;
  onRemoveAttendee: (index: number) => void;

  onUpdateActionItem: (
    id: string,
    field: keyof ActionItem,
    value: string
  ) => void;
  onRemoveActionItem: (id: string) => void;
  onAddActionItem: () => void;

  className?: string;
};

export default function MeetingEditor({
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
  className,
}: Props) {
  const [attendeeInput, setAttendeeInput] = React.useState("");
  const [sendOpen, setSendOpen] = React.useState(false); // <-- state mở modal

  // Editable contents
  const [agenda, setAgenda] = React.useState(
    [
      "1. Q3 Financial Performance Review",
      "2. Technical Infrastructure Update",
      "3. Business Impact Assessment",
      "4. UX Improvements Overview",
      "5. Q4 Action Items Planning",
    ].join("\n")
  );
  const [summary, setSummary] = React.useState(
    [
      "• Q2 improvements in user satisfaction scores…",
      "• Positive ROI metrics indicating success…",
      "The team discussed Q4 planning and established clear action items with specific deadlines to maintain momentum.",
    ].join("\n")
  );
  const [decisions, setDecisions] = React.useState(
    [
      "1. Prepare comprehensive business impact assessment…",
      "2. Approve additional security clearance for cloud…",
      "3. Legal review of data governance policies…",
    ].join("\n")
  );

  const handleAddAttendee = () => {
    const name = attendeeInput.trim();
    if (!name) return;
    onAddAttendee(name);
    setAttendeeInput("");
  };

  return (
    <div className={["space-y-6", className || ""].join(" ")}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Template:</span>
          <select className="px-3 py-2 border border-gray-300 rounded text-sm bg-white">
            <option>Default Meeting Template</option>
          </select>
        </div>
        <Button className="gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200">
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
        <Button className="gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200">
          <NotebookPen className="w-4 h-4" />
          Export Word
        </Button>
        {/* mở modal gửi email */}
        <Button
          className="gap-2 bg-black text-white hover:bg-black/90"
          onClick={() => setSendOpen(true)}
        >
          <Mail className="w-4 h-4" />
          Send Email
        </Button>
      </div>

      {/* Meeting Title */}
      <div className="space-y-1.5">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <TitleIcon className="w-4 h-4" />
          Meeting Title
        </label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Date & Time */}
      <div className="space-y-1.5">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <CalendarClock className="w-4 h-4" />
          Date & Time
        </label>
        <input
          type="text"
          value={meetingDate}
          onChange={(e) => onChangeDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
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
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Agenda */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <ListTodo className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Agenda</h3>
        </div>
        <textarea
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Meeting Summary */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Meeting Summary</h3>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Key Decisions */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Gavel className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-900">Key Decisions</h3>
        </div>
        <textarea
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
          className="w-full min-h-28 resize-y px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Action Items */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          <label className="font-semibold text-gray-900 text-sm">Action Items</label>
        </div>

        {/* Header row */}
        <div className="hidden md:grid grid-cols-12 text-xs text-gray-500 px-2">
          <div className="col-span-7 inline-flex items-center gap-2">
            <CheckSquare className="w-3 h-3" /> Description
          </div>
          <div className="col-span-3 inline-flex items-center gap-2">
            <UserCircle2 className="w-3 h-3" /> Assignee
          </div>
          <div className="col-span-2 inline-flex items-center gap-2">
            <CalendarDays className="w-3 h-3" /> Due Date
          </div>
        </div>

        <div className="space-y-2">
          {actionItems.map((item, idx) => (
            <div
              key={item.id}
              className={[
                "grid grid-cols-12 gap-2 items-center p-3 border border-gray-200 rounded",
                idx % 2 === 0 ? "bg-gray-50" : "bg-white",
              ].join(" ")}
            >
              <div className="col-span-12 md:col-span-7">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    onUpdateActionItem(item.id, "description", e.target.value)
                  }
                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <input
                  type="text"
                  value={item.assignee}
                  onChange={(e) =>
                    onUpdateActionItem(item.id, "assignee", e.target.value)
                  }
                  placeholder="Assignee"
                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="col-span-5 md:col-span-2">
                <input
                  type="text"
                  value={item.dueDate}
                  onChange={(e) =>
                    onUpdateActionItem(item.id, "dueDate", e.target.value)
                  }
                  placeholder="dd/mm/yyyy"
                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => onRemoveActionItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove action item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add button */}
        <div>
          <Button
            onClick={onAddActionItem}
            className="bg-black text-white hover:bg-black/90 gap-2"
          >
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
        // có thể truyền fileName, projectName thật từ props cha nếu cần
      />
    </div>
  );
}
