"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Edit2, Download, History, Trash2, FileText, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionItem, Attendee, Speaker, TranscriptLine } from "@/types/interfaces/meeting";
import MeetingTranscript from "./meeting-transcript";
import MeetingEditor from "./meeting-editor";

/* ---------- Mock data ---------- */
const speakers: Record<string, Speaker> = {
  "Sarah Johnson": { name: "Sarah Johnson", color: "text-blue-600" },
  "Lisa Wong": { name: "Lisa Wong", color: "text-blue-600" },
  "Mike Chen": { name: "Mike Chen", color: "text-blue-600" },
  "David Kim": { name: "David Kim", color: "text-blue-600" },
};

const transcriptData: TranscriptLine[] = [
  { speaker: "Sarah Johnson", text: "And Lisa, can you create a comprehensive UX improvement plan for the remaining product lines by ", actionItem: "December 1st, 2025" },
  { speaker: "Lisa Wong", text: "Yes, I'll have that ready and will include user research findings from our recent surveys." },
  { speaker: "Sarah Johnson", text: "Perfect. Before we conclude, are there any blockers or concerns we need to address?" },
  { speaker: "Mike Chen", text: "We might need additional security clearance for some cloud components. I'll reach out to the security team this week." },
  { speaker: "David Kim", text: "The legal team needs to review our data governance policies before the migration. I'll schedule a meeting with them." },
  { speaker: "Sarah Johnson", text: "Great. Let's reconvene in two weeks to track progress on these action items. Meeting adjourned at ", actionItem: "10:45 AM", time: "10:45 AM" },
];

/* ========================================================= */
type TabKey = "transcript" | "mom";

export default function MinuteDetailPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("transcript");

  const [meetingTitle, setMeetingTitle] = useState("Q3 Financial Review - Digital Transformation Initiative");
  const [meetingDate, setMeetingDate] = useState("21/09/2025, 10:00");
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "Sarah Johnson", role: "Project Manager" },
    { name: "David Kim", role: "Business Analyst" },
    { name: "Lisa Wong", role: "UX Designer" },
  ]);

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: "1", description: "Finalize cloud migration project plan with infrastructure team", assignee: "Mike Chen", dueDate: "15/12/2025" },
    { id: "2", description: "Prepare business impact assessment report with latest metrics and projections", assignee: "David Kim", dueDate: "30/11/2025" },
    { id: "3", description: "Create comprehensive UX improvement plan for remaining product lines", assignee: "Lisa Wong", dueDate: "01/12/2025" },
  ]);

  /* ---------- Handlers ---------- */
  const removeAttendee = (index: number) => setAttendees((s) => s.filter((_, i) => i !== index));
  const addAttendee = (name: string) => setAttendees((s) => [...s, { name, role: "" }]);

  const removeActionItem = (id: string) => setActionItems((s) => s.filter((i) => i.id !== id));
  const updateActionItem = (id: string, field: keyof ActionItem, value: string) =>
    setActionItems((s) => s.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
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

  /* ---------- Animated underline for tabs (giữ nguyên) ---------- */
  const tabsWrapRef = useRef<HTMLDivElement | null>(null);
  const tabBtnRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ transcript: null, mom: null });
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

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <button className="inline-flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Meeting Minutes</span>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-600">Q3_Financial_Report.pdf</span>
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">D</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">Q3_Financial_Report.pdf</h1>
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
              <p className="text-sm text-gray-600">Digital Transformation Initiative • Uploaded 2 hours ago</p>
            </div>
          </div>
        </div>

        {activeTab === "mom" && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
            <b>Editor Mode:</b> You can edit MoM content and export files. Changes will be highlighted for tracking.
          </div>
        )}

        <div className="border-b border-gray-200 pt-2">
          <div ref={tabsWrapRef} className="relative flex gap-8">
            <span
              className="pointer-events-none absolute -bottom-px h-[2px] bg-black rounded-full"
              style={{
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
                transition: "transform 260ms cubic-bezier(.22,.61,.36,1), width 260ms cubic-bezier(.22,.61,.36,1)",
              }}
            />
            <button
              ref={(el) => { (tabBtnRefs.current.transcript = el) }}
              onClick={() => setActiveTab("transcript")}
              className={["relative pb-3 px-1 inline-flex items-center gap-1.5 text-sm transition-colors", activeTab === "transcript" ? "text-black" : "text-gray-500 hover:text-gray-800"].join(" ")}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="font-medium">Transcript</span>
            </button>
            <button
              ref={(el) => { (tabBtnRefs.current.mom = el) }}
              onClick={() => setActiveTab("mom")}
              className={["relative pb-3 px-1 inline-flex items-center gap-1.5 text-sm transition-colors", activeTab === "mom" ? "text-black" : "text-gray-500 hover:text-gray-800"].join(" ")}
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
          {activeTab === "transcript" && <MeetingTranscript lines={transcriptData} speakers={speakers} />}

          {activeTab === "mom" && (
            <MeetingEditor
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
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">File Information</h3>

            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between">
                <dt className="text-gray-600">File Name</dt>
                <dd className="font-medium text-gray-900 text-right">Q3_Financial_Report.pdf</dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="text-gray-600">Project</dt>
                <dd className="font-medium text-gray-900 text-right">
                  Digital Transformation Initiative
                </dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="text-gray-600">Uploaded By</dt>
                <dd className="font-medium text-gray-900 text-right">Sarah Johnson</dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="text-gray-600">Date Uploaded</dt>
                <dd className="text-right">
                  <div className="font-medium text-gray-900">Sept 21, 2025</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Language</dt>
                <dd className="text-right">
                  <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    English
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>

            <div className="space-y-2.5">
              <Button
                className="w-full justify-start gap-2 h-10 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                Download Original Transcript
              </Button>

              <Button
                className="w-full justify-start gap-2 h-10 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                variant="outline"
              >
                <History className="w-4 h-4" />
                View Version History
              </Button>

              <Button
                className="w-full justify-start gap-2 h-10 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                variant="outline"
              >
                <Trash2 className="w-4 h-4" />
                Delete File
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
