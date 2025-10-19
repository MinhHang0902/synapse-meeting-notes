"use client";

import * as React from "react";
import { FileText, NotebookPen, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionItem, Attendee } from "@/types/interfaces/meeting";

type Props = {
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

    const handleAddAttendee = () => {
        const name = attendeeInput.trim();
        if (!name) return;
        onAddAttendee(name);
        setAttendeeInput("");
    };

    return (
        <div className={className}>
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
                <Button className="gap-2 bg-black text-white hover:bg-black/90">✉️ Send Email</Button>
            </div>

            {/* Meeting Title */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-900 text-sm">Meeting Title</label>
                <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => onChangeTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-900 text-sm">Date & Time</label>
                <input
                    type="text"
                    value={meetingDate}
                    onChange={(e) => onChangeDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
            </div>

            {/* Attendees */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-900 text-sm">Attendees</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {attendees.map((a, i) => (
                        <div
                            key={`${a.name}-${i}`}
                            className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2 text-sm"
                        >
                            <span className="text-gray-900">
                                {a.name} {a.role && `(${a.role})`}
                            </span>
                            <button onClick={() => onRemoveAttendee(i)} className="text-gray-400 hover:text-gray-600">
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

            {/* Agenda (static demo) */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-900 text-sm">Agenda</label>
                <div className="space-y-1 text-sm text-gray-700">
                    <div>1. Q3 Financial Performance Review</div>
                    <div>2. Technical Infrastructure Update</div>
                    <div>3. Business Impact Assessment</div>
                    <div>4. UX Improvements Overview</div>
                    <div>5. Q4 Action Items Planning</div>
                </div>
            </div>

            {/* Meeting Summary (static demo) */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-900 text-sm">Meeting Summary</label>
                <div className="text-sm text-gray-700 space-y-2">
                    <div>• Q2 improvements in user satisfaction scores…</div>
                    <div>• Positive ROI metrics indicating success…</div>
                    <div className="pt-2">
                        The team discussed Q4 planning and established clear action items with specific deadlines to maintain momentum.
                    </div>
                </div>
            </div>

            {/* Key Decisions (static demo) */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-900 text-sm">Key Decisions</label>
                <div className="text-sm text-gray-700 space-y-1">
                    <div>1. Prepare comprehensive business impact assessment…</div>
                    <div>2. Approve additional security clearance for cloud…</div>
                    <div>3. Legal review of data governance policies…</div>
                </div>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
                <label className="font-semibold text-gray-900 text-sm">Action Items</label>
                <div className="space-y-2">
                    {actionItems.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center p-3 border border-gray-200 rounded">
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => onUpdateActionItem(item.id, "description", e.target.value)}
                                    className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <input
                                type="text"
                                value={item.assignee}
                                onChange={(e) => onUpdateActionItem(item.id, "assignee", e.target.value)}
                                placeholder="Assignee"
                                className="w-28 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                                type="text"
                                value={item.dueDate}
                                onChange={(e) => onUpdateActionItem(item.id, "dueDate", e.target.value)}
                                placeholder="dd/mm/yyyy"
                                className="w-28 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <button onClick={() => onRemoveActionItem(item.id)} className="text-red-500 hover:text-red-700 flex-shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={onAddActionItem} className="text-black hover:text-gray-900 text-sm font-medium inline-flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Action Item
                </button>
            </div>
        </div>
    );
}
