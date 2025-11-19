"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Share2,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import SendMinuteModal from "./send-minute-modal";
import { TrelloIntegrationApi } from "@/lib/api/trello-integration";
import type {
  TrelloBoard,
  TrelloExportResponse,
  TrelloIntegrationStatus,
  TrelloList,
} from "@/types/interfaces/trello";

export type ActionItem = {
  id: string;
  description: string;
  assignee: string;
  assigneeId?: number;
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
  onRemoveActionItem: (id: string) => void | Promise<void>;
  onAddActionItem: () => void;

  onBeforeSend?: () => Promise<void> | void;
  onSave?: (draft: EditorDraft) => Promise<void> | void;
  saving?: boolean;
  lastSavedAt?: Date;

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedAttendeeId, setSelectedAttendeeId] = React.useState<number | "">("");
  const [sendOpen, setSendOpen] = React.useState(false);
  const [exportingTrello, setExportingTrello] = React.useState(false);
  const [trelloModalOpen, setTrelloModalOpen] = React.useState(false);
  const [trelloStatus, setTrelloStatus] = React.useState<TrelloIntegrationStatus | null>(null);
  const [loadingTrelloStatus, setLoadingTrelloStatus] = React.useState(false);
  const [connectingTrello, setConnectingTrello] = React.useState(false);
  const [disconnectingTrello, setDisconnectingTrello] = React.useState(false);
  const [trelloBoards, setTrelloBoards] = React.useState<TrelloBoard[]>([]);
  const [loadingTrelloBoards, setLoadingTrelloBoards] = React.useState(false);
  const [trelloLists, setTrelloLists] = React.useState<TrelloList[]>([]);
  const [loadingTrelloLists, setLoadingTrelloLists] = React.useState(false);
  const [selectedBoardId, setSelectedBoardId] = React.useState("");
  const [selectedTrelloListId, setSelectedTrelloListId] = React.useState("");
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // Toast states
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showErrorToast, setShowErrorToast] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Toast helper functions
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorToast(true);
  };

  React.useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  React.useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => {
        setShowErrorToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  const loadTrelloLists = React.useCallback(
    async (boardId: string) => {
      if (!boardId) {
        setTrelloLists([]);
        setSelectedTrelloListId("");
        return;
      }

      try {
        setLoadingTrelloLists(true);
        const response = await fetch(`/api/trello/lists?boardId=${encodeURIComponent(boardId)}`);
        const data = (await response.json()) as { lists?: TrelloList[]; message?: string };
        if (response.status === 404) {
          setTrelloStatus({ connected: false });
          setTrelloLists([]);
          setSelectedTrelloListId("");
          return;
        }
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }
        if (!response.ok) {
          throw new Error(
            typeof data.message === "string"
              ? data.message
              : "Unable to load Trello lists. Please check the board ID.",
          );
        }
        const lists = Array.isArray(data.lists) ? data.lists : [];
        setTrelloLists(lists);
        if (lists.length > 0) {
          setSelectedTrelloListId(lists[0].id);
        } else {
          setSelectedTrelloListId("");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load Trello lists.";
        showError(message);
      } finally {
        setLoadingTrelloLists(false);
      }
    },
    [],
  );

  const loadTrelloBoards = React.useCallback(async () => {
    try {
      setLoadingTrelloBoards(true);
      const response = await fetch("/api/trello/boards");
      const data = (await response.json()) as { boards?: TrelloBoard[]; message?: string };
      if (response.status === 404) {
        setTrelloStatus({ connected: false });
        setTrelloBoards([]);
        setTrelloLists([]);
        setSelectedBoardId("");
        setSelectedTrelloListId("");
        return;
      }
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }
      if (!response.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Unable to load Trello boards. Please check your token.",
        );
      }
      const boards = Array.isArray(data.boards) ? data.boards : [];
      setTrelloBoards(boards);
      if (boards.length > 0) {
        const firstBoardId = boards[0].id;
        setSelectedBoardId(firstBoardId);
        setSelectedTrelloListId("");
        setTrelloLists([]);
        void loadTrelloLists(firstBoardId);
      } else {
        setSelectedBoardId("");
        setTrelloLists([]);
        setSelectedTrelloListId("");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load Trello boards.";
      showError(message);
    } finally {
      setLoadingTrelloBoards(false);
    }
  }, [loadTrelloLists]);

  const handleConnectTrello = React.useCallback(async () => {
    if (connectingTrello) return;
    if (typeof window === "undefined") return;
    try {
      setConnectingTrello(true);
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      const response = await fetch(
        `/api/trello/oauth/request-token?returnUrl=${encodeURIComponent(returnUrl)}`,
      );
      const data = (await response.json()) as { redirectUrl?: string; message?: string };
      if (!response.ok || !data.redirectUrl) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Unable to initiate Trello connection. Please try again.",
        );
      }
      window.location.href = data.redirectUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to connect to Trello. Please try again.";
      showError(message);
    } finally {
      setConnectingTrello(false);
    }
  }, [connectingTrello]);

  const handleDisconnectTrello = React.useCallback(async () => {
    if (disconnectingTrello) return;
    try {
      setDisconnectingTrello(true);
      await TrelloIntegrationApi.disconnect();
      showSuccess("Disconnected from Trello successfully.");
      setTrelloStatus({ connected: false });
      setTrelloBoards([]);
      setTrelloLists([]);
      setSelectedBoardId("");
      setSelectedTrelloListId("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to disconnect from Trello. Please try again.";
      showError(message);
    } finally {
      setDisconnectingTrello(false);
    }
  }, [disconnectingTrello]);

  const refreshTrelloStatus = React.useCallback(async () => {
    try {
      setLoadingTrelloStatus(true);
      const status = await TrelloIntegrationApi.getStatus();
      setTrelloStatus(status);
      if (status.connected) {
        await loadTrelloBoards();
      } else {
        setTrelloBoards([]);
        setTrelloLists([]);
        setSelectedBoardId("");
        setSelectedTrelloListId("");
      }
    } catch (error) {
      console.error("Failed to load Trello status", error);
      setTrelloStatus({ connected: false });
    } finally {
      setLoadingTrelloStatus(false);
    }
  }, [loadTrelloBoards]);

  const trelloConnectedParam = searchParams?.get("trelloConnected");
  const trelloErrorParam = searchParams?.get("trelloError");

  React.useEffect(() => {
    if (!trelloModalOpen) return;
    void refreshTrelloStatus();
  }, [trelloModalOpen, refreshTrelloStatus]);

  React.useEffect(() => {
    if (!trelloConnectedParam) return;
    if (typeof window === "undefined") return;

    if (trelloConnectedParam === "1") {
      showSuccess("Connected to Trello successfully.");
    } else {
      showError(trelloErrorParam || "Failed to connect to Trello. Please try again.");
    }

    void refreshTrelloStatus();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("trelloConnected");
    params.delete("trelloError");
    const newQuery = params.toString();
    const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [trelloConnectedParam, trelloErrorParam, refreshTrelloStatus, router, searchParams]);

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
    const html = buildExportHtml();
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.focus();
      w.print();
    }, 300);
  };

  const [agenda, setAgenda] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [decisions, setDecisions] = React.useState("");
  const [showSavedToast, setShowSavedToast] = React.useState(false);

  React.useEffect(() => {
    setAgenda(initialAgenda ?? "");
    setSummary(initialSummary ?? "");
    setDecisions(initialDecisions ?? "");
  }, []);

  React.useEffect(() => {
    if (showSavedToast) {
      const timer = setTimeout(() => {
        setShowSavedToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedToast]);

  const handleAddAttendee = () => {
    if (!selectedAttendeeId) return;
    const selected = projectMembers.find((m) => m.user.user_id === selectedAttendeeId);
    if (!selected) return;
    
    const alreadyAdded = attendees.some((a) => a.userId === selected.user.user_id);
    if (alreadyAdded) {
      setSelectedAttendeeId("");
      return;
    }
    
    onAddAttendee(selected.user.user_id, selected.user.name, selected.projectRole.role_type);
    setSelectedAttendeeId("");
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
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
    setShowSavedToast(true);
  };

  const handleExportTrello = async (listId: string, boardId: string) => {
    if (exportingTrello) return;
    try {
      setExportingTrello(true);
      const response = await fetch("/api/trello/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingTitle,
          actionItems: actionItems.map((item) => ({
            description: item.description,
            assignee: item.assignee,
            dueDate: item.dueDate,
          })),
          listId,
          boardId,
        }),
      });

      const data = (await response.json()) as TrelloExportResponse | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in data && typeof data.message === "string"
            ? data.message
            : "Failed to export to Trello. Please try again.",
        );
      }

      const cardsCreated = "cardsCreated" in data ? data.cardsCreated : 0;
      showSuccess(`Successfully created ${cardsCreated} card(s) on Trello.`);
      setTrelloModalOpen(false);
      setSelectedTrelloListId("");
      setSelectedBoardId("");
      setTrelloLists([]);
      setTrelloBoards([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to export to Trello. Please try again.";
      showError(message);
    } finally {
      setExportingTrello(false);
    }
  };

  const addFromUser = (member: ProjectMember) => {
    const alreadyAdded = attendees.some((a) => a.userId === member.user.user_id);
    if (alreadyAdded) {
      return;
    }
    onAddAttendee(member.user.user_id, member.user.name, member.projectRole.role_type);
  };

  return (
    <div className={["space-y-6", className || ""].join(" ")}>
      {/* Toast Success */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Toast Error */}
      {showErrorToast && (
        <div className="fixed top-4 right-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <Button className="gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200" onClick={exportPdf}>
          <FileText className="w-4 h-4" /> Export PDF
        </Button>
        
        <Button className="gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200" onClick={downloadWord}>
          <NotebookPen className="w-4 h-4" /> Export Word
        </Button>
        
        <Button
          className="gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setTrelloModalOpen(true)}
          disabled={exportingTrello}
        >
          <Share2 className="w-4 h-4" /> Export Trello
        </Button>
        
        <Button
          className="gap-1.5 px-3 py-2 text-sm bg-gray-900 text-white hover:bg-black"
          onClick={async () => {
            if (onSave) await emitSave();
            if (onBeforeSend) await onBeforeSend();
            setSendOpen(true);
          }}
        >
          <Mail className="w-4 h-4" /> Send Email
        </Button>

        <div className="relative">
          {showSavedToast && (
            <div className="absolute bottom-full right-0 mb-2 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Saved just now!</span>
            </div>
          )}

          <Button
            className="gap-1.5 px-3 py-2 text-sm bg-black text-white hover:bg-black/90"
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
        </div>
      </div>

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

      <div className="space-y-1.5">
        <label className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
          <CalendarClock className="w-4 h-4" /> Date & Time
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Date Input (DD/MM/YYYY) */}
          <div className="relative">
            {/* Hidden date input for picker */}
            <input
              ref={dateInputRef}
              type="date"
              value={meetingDate ? new Date(meetingDate).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const time = meetingDate ? new Date(meetingDate).toTimeString().slice(0, 5) : '00:00';
                  const isoString = `${e.target.value}T${time}`;
                  onChangeDate(isoString);
                }
              }}
              className="absolute opacity-0 pointer-events-none"
            />
            {/* Visible text input for display */}
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={meetingDate ? new Date(meetingDate).toLocaleDateString('en-GB') : ''}
              onChange={(e) => {
                const value = e.target.value;
                const [day, month, year] = value.split('/');
                if (day && month && year && year.length === 4) {
                  const time = meetingDate ? new Date(meetingDate).toTimeString().slice(0, 5) : '00:00';
                  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
                  onChangeDate(isoString);
                } else if (value === '') {
                  onChangeDate('');
                }
              }}
              className="w-full px-4 py-2 pr-10 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400"
            />
            <button
              type="button"
              onClick={handleCalendarClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          
          {/* Time Input (HH:MM) */}
          <div>
            <input
              type="time"
              value={meetingDate ? new Date(meetingDate).toTimeString().slice(0, 5) : ''}
              onChange={(e) => {
                if (meetingDate) {
                  const date = new Date(meetingDate);
                  const [hours, minutes] = e.target.value.split(':');
                  date.setHours(parseInt(hours), parseInt(minutes));
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  onChangeDate(`${year}-${month}-${day}T${e.target.value}`);
                }
              }}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400"
            />
          </div>
        </div>
      </div>

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
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Select member to add..."
              value={
                selectedAttendeeId
                  ? projectMembers.find((m) => m.user.user_id === selectedAttendeeId)?.user.name || ""
                  : ""
              }
              readOnly
              className="w-full h-9 px-3 pr-9 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors cursor-pointer"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-72 overflow-auto" align="end">
                {projectMembers.filter((m) => !attendees.some((a) => a.userId === m.user.user_id)).length === 0 && (
                  <DropdownMenuItem disabled>No available members</DropdownMenuItem>
                )}
                {projectMembers
                  .filter((m) => !attendees.some((a) => a.userId === m.user.user_id))
                  .map((member) => (
                    <DropdownMenuItem
                      key={member.user.user_id}
                      onClick={() => setSelectedAttendeeId(member.user.user_id)}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{member.user.name}</span>
                        <span className="text-xs text-gray-500">{member.user.email} - {member.projectRole.role_type}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            onClick={handleAddAttendee}
            disabled={!selectedAttendeeId}
            className="px-4 bg-black text-white hover:bg-black/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="-mx-6 border-t border-gray-200"></div>

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
      <Dialog
        open={trelloModalOpen}
        onOpenChange={(open) => {
          if (!open && exportingTrello) return;
          setTrelloModalOpen(open);
          if (!open) {
            setSelectedTrelloListId("");
            setSelectedBoardId("");
            setTrelloLists([]);
            setTrelloBoards([]);
          }
        }}
      >
        <DialogContent className="space-y-6">
          <DialogHeader>
            <DialogTitle>Export to Trello</DialogTitle>
            <DialogDescription>
              Select a Trello list to create cards from the current action items.
            </DialogDescription>
          </DialogHeader>

          {loadingTrelloStatus ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking Trello status…
            </div>
          ) : trelloStatus?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <div>
                  Connected as{" "}
                  <span className="font-medium">
                    {trelloStatus.member?.fullName || trelloStatus.member?.username || "Trello user"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisconnectTrello}
                  disabled={disconnectingTrello || exportingTrello}
                >
                  {disconnectingTrello ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting…
                    </>
                  ) : (
                    "Disconnect"
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900" htmlFor="trello-board-select">
                  Trello Board
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select board..."
                    value={selectedBoardId ? trelloBoards.find((b) => b.id === selectedBoardId)?.name || "" : ""}
                    readOnly
                    className="w-full h-9 px-3 pr-9 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={loadingTrelloBoards || exportingTrello}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-72 overflow-auto" align="end">
                      {trelloBoards.length === 0 ? (
                        <DropdownMenuItem disabled>No boards available</DropdownMenuItem>
                      ) : (
                        trelloBoards.map((board) => (
                          <DropdownMenuItem
                            key={board.id}
                            onClick={() => {
                              setSelectedBoardId(board.id);
                              setSelectedTrelloListId("");
                              setTrelloLists([]);
                              if (board.id) {
                                void loadTrelloLists(board.id);
                              }
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">{board.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {loadingTrelloBoards && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading boards…
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900" htmlFor="trello-list-select">
                  Trello List
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="No lists available"
                    value={selectedTrelloListId ? trelloLists.find((l) => l.id === selectedTrelloListId)?.name || "" : ""}
                    readOnly
                    className="w-full h-9 px-3 pr-9 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={trelloLists.length === 0 || exportingTrello || loadingTrelloLists || !selectedBoardId}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-72 overflow-auto" align="end">
                      {trelloLists.length === 0 ? (
                        <DropdownMenuItem disabled>No lists available</DropdownMenuItem>
                      ) : (
                        trelloLists.map((list) => (
                          <DropdownMenuItem
                            key={list.id}
                            onClick={() => setSelectedTrelloListId(list.id)}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">{list.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {loadingTrelloLists && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading lists…
                  </div>
                )}
                <p className="text-xs text-gray-500">Board must belong to the connected Trello account.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your account is not connected to Trello. Connect to export action items as Trello cards.
              </p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleConnectTrello}
                disabled={connectingTrello}
              >
                {connectingTrello ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Trello…
                  </>
                ) : (
                  "Connect to Trello"
                )}
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (exportingTrello) return;
                setTrelloModalOpen(false);
                setSelectedTrelloListId("");
                setSelectedBoardId("");
                setTrelloLists([]);
                setTrelloBoards([]);
              }}
            >
              Cancel
            </Button>
            {trelloStatus?.connected && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  if (!selectedBoardId) {
                    showError("Please select a Trello board.");
                    return;
                  }
                  if (!selectedTrelloListId) {
                    showError("Please select a Trello list before exporting.");
                    return;
                  }
                  void handleExportTrello(selectedTrelloListId, selectedBoardId);
                }}
                disabled={
                  !selectedTrelloListId ||
                  !selectedBoardId ||
                  exportingTrello ||
                  loadingTrelloLists
                }
              >
                {exportingTrello ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Exporting…
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActionItemRow({
  item,
  projectMembers,
  onUpdateActionItem,
  onRemoveActionItem,
}: {
  item: ActionItem;
  projectMembers: ProjectMember[];
  onUpdateActionItem: (id: string, field: keyof ActionItem, value: string | number) => void;
  onRemoveActionItem: (id: string) => void | Promise<void>;
}) {
  const dueDateInputRef = React.useRef<HTMLInputElement>(null);
  const handleDueDateCalendarClick = () => {
    if (dueDateInputRef.current) {
      dueDateInputRef.current.showPicker?.();
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
          className="w-full h-8 text-sm px-2 py-1 bg-white border border-gray-200 rounded focus:border-gray-400"
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Select assignee..."
            value={item.assigneeId ? projectMembers.find((m) => m.user.user_id === item.assigneeId)?.user.name || "" : ""}
            readOnly
            className="w-full h-8 px-2 pr-7 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded focus:outline-none focus:border-gray-400 transition-colors cursor-pointer"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded focus:outline-none"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-72 overflow-auto" align="end">
              {projectMembers.length === 0 ? (
                <DropdownMenuItem disabled>No members available</DropdownMenuItem>
              ) : (
                projectMembers.map((member) => (
                  <DropdownMenuItem
                    key={member.user.user_id}
                    onClick={() => {
                      onUpdateActionItem(item.id, "assigneeId", member.user.user_id);
                      onUpdateActionItem(item.id, "assignee", member.user.name);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{member.user.name}</span>
                      <span className="text-xs text-gray-500">{member.user.email}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="col-span-5 md:col-span-2">
        <div className="relative">
          {/* Hidden date input for picker */}
          <input
            ref={dueDateInputRef}
            type="date"
            value={item.dueDate || ''}
            onChange={(e) => {
              onUpdateActionItem(item.id, "dueDate", e.target.value);
            }}
            className="absolute opacity-0 pointer-events-none"
          />
          {/* Visible text input for display */}
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={item.dueDate ? (() => {
              const date = new Date(item.dueDate + 'T00:00:00');
              if (isNaN(date.getTime())) return item.dueDate;
              return date.toLocaleDateString('en-GB');
            })() : ''}
            onChange={(e) => {
              const value = e.target.value;
              const [day, month, year] = value.split('/');
              if (day && month && year && year.length === 4) {
                const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                onUpdateActionItem(item.id, "dueDate", isoDate);
              } else if (value === '') {
                onUpdateActionItem(item.id, "dueDate", '');
              }
            }}
            className="w-full h-8 text-sm px-2 py-1 pr-7 bg-white border border-gray-200 rounded focus:border-gray-400"
          />
          <button
            type="button"
            onClick={handleDueDateCalendarClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <button
          onClick={async () => {
            await onRemoveActionItem(item.id);
          }}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove action item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}