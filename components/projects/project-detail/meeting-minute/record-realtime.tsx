// app/(project)/pages/projects/[id]/upload-minute/real-time/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Download, Home, Pause, Play, Share2 } from "lucide-react";
import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  isTrackReference,
  useLocalParticipant,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import {
  RoomEvent,
  Track,
  type LocalParticipant,
  type LocalTrackPublication,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
import "@livekit/components-styles";

import { cn } from "@/lib/utils";
import type {
  RealtimeRecordingAsset,
  RealtimeTokenResponse,
} from "@/types/interfaces/realtime";

type RecordingResult = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  startedAt: number | null;
  originalMimeType?: string;
};

type JoinState = "idle" | "connecting";

export default function RealtimeMeeting() {
  const params = useParams<{ id?: string }>();
  const projectParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const projectId = Number(projectParam);

  const [joinState, setJoinState] = useState<JoinState>("idle");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [connection, setConnection] = useState<RealtimeTokenResponse | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [recordingAsset, setRecordingAsset] = useState<RealtimeRecordingAsset | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState<"idle" | "active" | "loading">("loading");
  const [meetingRole, setMeetingRole] = useState<"host" | "participant" | null>(null);
  const [hostIdentity, setHostIdentity] = useState<string | null>(null);
  const isHostRef = useRef(false);

  const isConnecting = joinState === "connecting" || (shouldConnect && !isConnected);

  const resetRecordingAsset = useCallback(() => {
    setRecordingAsset((previous) => {
      if (previous?.url) {
        URL.revokeObjectURL(previous.url);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    if (!Number.isFinite(projectId) || projectId <= 0) {
      setMeetingStatus("idle");
      return;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/realtime/status?projectId=${projectId}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Không thể lấy trạng thái cuộc họp.");
        }
        const data = await response.json();
        if (cancelled) return;
        setMeetingStatus(data.meetingActive ? "active" : "idle");
        setHostIdentity(data.hostIdentity ?? null);
      } catch (error) {
        if (cancelled) return;
        console.warn("Không thể tải trạng thái cuộc họp:", error);
        setMeetingStatus("idle");
      }
    };

    setMeetingStatus("loading");
    fetchStatus();
    const interval = window.setInterval(fetchStatus, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [projectId]);

  const handleRecordingReady = useCallback(
    (result: RecordingResult) => {
      setRecordingError(null);
      setRecordingAsset((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }

        const createdAt = new Date();
        const startedAt = result.startedAt ? new Date(result.startedAt) : null;
        const extension = determineFileExtension(result.mimeType);
        const safeProjectSegment =
          Number.isFinite(projectId) && !Number.isNaN(projectId) && projectId > 0
            ? `project-${projectId}`
            : "meeting";
        const timestampSegment = createdAt.toISOString().replace(/[:.]/g, "-");
        const fileName = `${safeProjectSegment}-${timestampSegment}.${extension}`;
        const url = URL.createObjectURL(result.blob);

        return {
          blob: result.blob,
          url,
          mimeType: result.mimeType,
          originalMimeType: result.originalMimeType ?? result.mimeType,
          size: result.blob.size,
          durationMs: result.durationMs,
          startedAt,
          createdAt,
          fileName,
        };
      });
    },
    [projectId]
  );

  const handleRecordingError = useCallback((message: string) => {
    setRecordingError(message);
  }, []);

  const handleExportRecording = useCallback(() => {
    if (!recordingAsset || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const link = document.createElement("a");
      link.href = recordingAsset.url;
      link.download = recordingAsset.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, recordingAsset]);

  useEffect(() => {
    return () => {
      if (recordingAsset?.url) {
        URL.revokeObjectURL(recordingAsset.url);
      }
    };
  }, [recordingAsset?.url]);


  const handleMeetingStatusChange = useCallback(
    (status: "idle" | "active", hostId: string | null) => {
      setMeetingStatus(status);
      setHostIdentity(hostId ?? null);
      if (status === "idle") {
        setMeetingRole(null);
      }
    },
    []
  );

  const handleForceDisconnect = useCallback(() => {
    setShouldConnect(false);
  }, []);

  const handleToggleMeeting = useCallback(async () => {
    if (joinState === "connecting") return;

    if (isConnected) {
      setShouldConnect(false);
      return;
    }

    if (!projectId || Number.isNaN(projectId)) {
      setJoinError("Không xác định được dự án từ đường dẫn hiện tại.");
      return;
    }

    resetRecordingAsset();
    setRecordingError(null);
    setJoinState("connecting");
    setJoinError(null);
    setScreenError(null);

    try {
      const response = await fetch("/api/realtime/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        const message =
          payload?.error ?? "Không thể tham gia cuộc họp. Vui lòng thử lại.";
        throw new Error(message);
      }

      const tokenPayload = payload as RealtimeTokenResponse;
      setConnection(tokenPayload);
      if (tokenPayload.hostIdentity) {
        setHostIdentity(tokenPayload.hostIdentity);
      }
      setShouldConnect(true);
    } catch (error) {
      console.error("Không thể tham gia phòng họp", error);
      setJoinError(
        error instanceof Error
          ? error.message
          : "Không thể tham gia cuộc họp. Vui lòng thử lại."
      );
      setJoinState("idle");
    }
  }, [isConnected, joinState, projectId, resetRecordingAsset, setRecordingError]);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
    setJoinState("idle");
    setMeetingStatus("active");

    if (connection?.isHostCandidate) {
      setMeetingRole("host");
      setHostIdentity(connection.identity);
      isHostRef.current = true;
    } else {
      setMeetingRole("participant");
      setHostIdentity((prev) => connection?.hostIdentity ?? prev ?? connection?.activeParticipantIdentities[0] ?? null);
      isHostRef.current = false;
    }
  }, [connection]);

  const handleDisconnected = useCallback(() => {
    const wasHost = isHostRef.current;
    setIsConnected(false);
    setShouldConnect(false);
    setConnection(null);
    setScreenError(null);
    setJoinState("idle");
    if (!wasHost) {
      resetRecordingAsset();
    }
    setMeetingRole(null);
    if (wasHost) {
      setMeetingStatus("idle");
      setHostIdentity(null);
    }
    isHostRef.current = false;
  }, [resetRecordingAsset]);

  const handleRoomError = useCallback((error: Error) => {
    console.error("LiveKit room error", error);
    setJoinError(error.message);
    setJoinState("idle");
    setShouldConnect(false);
    setIsConnected(false);
    setConnection(null);
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Realtime Meeting
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Tổ chức họp trực tuyến, chia sẻ màn hình và kết nối mọi thành viên trong dự án thông qua LiveKit.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>

      {joinError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-4 py-3 flex items-start gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>{joinError}</div>
        </div>
      )}

      {recordingError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-md px-4 py-3 text-sm">
          {recordingError}
        </div>
      )}

      {connection ? (
        <LiveKitRoom
          serverUrl={connection.url}
          token={connection.token}
          connect={shouldConnect}
          options={{ adaptiveStream: true, dynacast: true }}
          audio
          video={false}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          onError={handleRoomError}
          className="space-y-6"
        >
          <ConnectedControls
            isConnected={isConnected}
            isConnecting={isConnecting}
            roomName={connection.metadata.roomName}
            onToggleMeeting={handleToggleMeeting}
            onScreenError={setScreenError}
            onRecordingReady={handleRecordingReady}
            onRecordingError={handleRecordingError}
            onExport={handleExportRecording}
            canExport={Boolean(recordingAsset)}
            exportDisabled={isExporting}
            recordingAsset={recordingAsset}
            meetingRole={meetingRole}
            onMeetingStatusChange={handleMeetingStatusChange}
            onForceDisconnect={handleForceDisconnect}
            hostIdentity={hostIdentity}
            projectId={projectId}
          />
          <MeetingStage />
        </LiveKitRoom>
      ) : (
        <DisconnectedControls
          isConnecting={isConnecting}
          onStart={handleToggleMeeting}
          onExport={handleExportRecording}
          canExport={Boolean(recordingAsset)}
          exportDisabled={isExporting}
          recordingAsset={recordingAsset}
          meetingStatus={meetingStatus}
          hostIdentity={hostIdentity}
        />
      )}

      {!connection && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Screen Share
          </h2>
          <p className="text-sm text-gray-500">
            Khi đã kết nối, màn hình được chia sẻ từ bất kỳ thành viên nào sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      {screenError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-4 py-3 flex items-start gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>{screenError}</div>
        </div>
      )}
    </div>
  );
}

function DisconnectedControls({
  isConnecting,
  onStart,
  onExport,
  canExport,
  exportDisabled,
  recordingAsset,
  meetingStatus,
  hostIdentity,
}: {
  isConnecting: boolean;
  onStart: () => void;
  onExport: () => void;
  canExport: boolean;
  exportDisabled: boolean;
  recordingAsset: RealtimeRecordingAsset | null;
  meetingStatus: "idle" | "active" | "loading";
  hostIdentity: string | null;
}) {
  const primaryLabel =
    meetingStatus === "active" ? "Join Meeting" : "Start Meeting";
  const isPrimaryDisabled = isConnecting || meetingStatus === "loading";

  return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
            Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <button
          onClick={onStart}
          disabled={isPrimaryDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
            >
          {isConnecting ? (
                <>
              <Play className="w-4 h-4 animate-spin" />
              Đang kết nối...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {primaryLabel}
                </>
              )}
            </button>

            <button
          onClick={onExport}
          disabled={!canExport || exportDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {exportDisabled ? "Exporting..." : "Export Audio"}
            </button>

            <button
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-400 shadow-sm cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
          Share Screen
            </button>
        </div>

      <p className="mt-3 text-xs text-gray-500">
        {meetingStatus === "active"
          ? "Cuộc họp đang diễn ra. Nhấn “Join Meeting” để tham gia."
          : "Kết nối để bắt đầu cuộc họp và chia sẻ màn hình với các thành viên khác."}
      </p>
      {recordingAsset && (
        <p className="mt-2 text-xs text-gray-500">
          Bản ghi gần nhất: {formatDuration(recordingAsset.durationMs)} ·{" "}
          {formatFileSize(recordingAsset.size)}
        </p>
      )}
      {meetingStatus === "active" && hostIdentity && (
        <p className="mt-1 text-xs text-gray-500">
          Host hiện tại: {hostIdentity}
        </p>
      )}
      </div>
  );
}

function ConnectedControls({
  isConnected,
  isConnecting,
  roomName,
  onToggleMeeting,
  onScreenError,
  onRecordingReady,
  onRecordingError,
  onExport,
  canExport,
  exportDisabled,
  recordingAsset,
  meetingRole,
  onMeetingStatusChange,
  onForceDisconnect,
  hostIdentity,
  projectId,
}: {
  isConnected: boolean;
  isConnecting: boolean;
  roomName: string;
  onToggleMeeting: () => void;
  onScreenError: (value: string | null) => void;
  onRecordingReady: (result: RecordingResult) => void;
  onRecordingError: (message: string) => void;
  onExport: () => void;
  canExport: boolean;
  exportDisabled: boolean;
  recordingAsset: RealtimeRecordingAsset | null;
  meetingRole: "host" | "participant" | null;
  onMeetingStatusChange: (status: "idle" | "active", hostId: string | null) => void;
  onForceDisconnect: () => void;
  hostIdentity: string | null;
  projectId: number;
}) {
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const {
    status: recordingStatus,
    error: internalRecordingError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRoomAudioRecorder({
    onRecordingReady,
    onRecordingError,
  });
  const [hasBroadcastStart, setHasBroadcastStart] = useState(false);
  const room = useRoomContext();
  const isHost = meetingRole === "host";
  const localIdentity = room?.localParticipant?.identity ?? null;

  useEffect(() => {
    if (!isConnected || !isHost) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await startRecording();
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Không thể bắt đầu ghi âm cuộc họp.";
        onRecordingError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isConnected, isHost, onRecordingError, startRecording]);

  useEffect(() => {
    if (isConnected || !isHost) {
      return;
    }

    let isMounted = true;

    (async () => {
      if ((recordingStatus === "recording" || recordingStatus === "stopping") && isHost) {
        try {
          await stopRecording();
        } catch (error) {
          if (!isMounted) return;
          const message =
            error instanceof Error
              ? error.message
              : "Không thể dừng ghi âm cuộc họp.";
          onRecordingError(message);
        }
      }
    })().finally(() => {
      if (isMounted) {
        resetRecording();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isConnected, isHost, onRecordingError, recordingStatus, resetRecording, stopRecording]);

  useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const message = JSON.parse(decoded);
        if (message?.type !== "meeting-status") return;

        if (message.status === "started") {
          onMeetingStatusChange("active", message.hostIdentity ?? null);
        } else if (message.status === "ended") {
          onMeetingStatusChange("idle", message.hostIdentity ?? null);
          if (!isHost) {
            resetRecording();
            onForceDisconnect();
          }
        }
      } catch (error) {
        console.warn("Không thể đọc dữ liệu meeting-status:", error);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);

    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [isHost, onForceDisconnect, onMeetingStatusChange, resetRecording, room]);

  useEffect(() => {
    if (!isHost || !isConnected || !room || hasBroadcastStart) {
      return;
    }

    try {
      const encoder = new TextEncoder();
      const message = encoder.encode(
        JSON.stringify({
          type: "meeting-status",
          status: "started",
          hostIdentity: localIdentity,
        })
      );
      room.localParticipant?.publishData(message, { reliable: true });
      onMeetingStatusChange("active", localIdentity ?? null);
      setHasBroadcastStart(true);
    } catch (error) {
      console.warn("Không thể broadcast trạng thái cuộc họp:", error);
    }
  }, [hasBroadcastStart, isConnected, isHost, localIdentity, onMeetingStatusChange, room]);

  useEffect(() => {
    if (!isConnected) {
      setHasBroadcastStart(false);
    }
  }, [isConnected]);

  const handleEndMeeting = useCallback(async () => {
    if (isEndingMeeting || !isHost) return;

    setIsEndingMeeting(true);
    try {
      await stopRecording();
      if (room) {
        try {
          const encoder = new TextEncoder();
          const message = encoder.encode(
            JSON.stringify({
              type: "meeting-status",
              status: "ended",
              hostIdentity: localIdentity,
            })
          );
          await room.localParticipant?.publishData(message, { reliable: true });
        } catch (error) {
          console.warn("Không thể gửi thông báo kết thúc cuộc họp:", error);
        }
      }

      try {
        await fetch("/api/realtime/end", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        });
      } catch (error) {
        console.warn("Không thể gọi API kết thúc phòng:", error);
      }

      onMeetingStatusChange("idle", null);
      setHasBroadcastStart(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể kết thúc ghi âm cuộc họp.";
      onRecordingError(message);
    } finally {
      onToggleMeeting();
      setIsEndingMeeting(false);
    }
  }, [
    isEndingMeeting,
    isHost,
    localIdentity,
    onMeetingStatusChange,
    onRecordingError,
    onToggleMeeting,
    room,
    stopRecording,
    projectId,
  ]);

  const isStoppingRecording = recordingStatus === "stopping";
  const recordingStatusLabel =
    isHost && recordingStatus === "recording"
      ? "Đang ghi âm cuộc họp..."
      : recordingAsset
      ? "Bản ghi gần nhất đã sẵn sàng để export."
      : isHost
      ? "Ghi âm sẽ bắt đầu khi kết nối thành công."
      : "Đang tham gia cuộc họp.";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Controls
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Đang ở phòng: <span className="font-medium">{roomName}</span>
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Micro của bạn sẽ được bật tự động khi tham gia phòng.
        </p>
          </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {isHost ? (
          <button
            onClick={handleEndMeeting}
            disabled={(isConnecting && !isConnected) || isEndingMeeting || isStoppingRecording}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
          >
            {isConnected ? (
              <>
                {isEndingMeeting || isStoppingRecording ? (
                  <Play className="w-4 h-4 animate-spin" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                {isEndingMeeting || isStoppingRecording ? "Đang kết thúc..." : "End Meeting"}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 animate-spin" />
                Đang kết nối...
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-400 shadow-sm cursor-not-allowed"
            title="Chỉ host mới có thể kết thúc cuộc họp."
          >
            <Pause className="w-4 h-4" />
            Waiting for host
          </button>
        )}

        <button
          onClick={onExport}
          disabled={!canExport || exportDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm disabled:text-gray-400 disabled:cursor-not-allowed"
          title={canExport ? undefined : "Bản ghi âm sẽ sẵn sàng sau khi kết thúc cuộc họp."}
        >
          <Download className="w-4 h-4" />
          {exportDisabled ? "Exporting..." : "Export Audio"}
        </button>

        <ShareScreenToggleButton onError={onScreenError} />
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-gray-500">{recordingStatusLabel}</p>
        {recordingAsset && (
          <p className="text-xs text-gray-500">
            Bản ghi gần nhất: {formatDuration(recordingAsset.durationMs)} · {formatFileSize(recordingAsset.size)}
          </p>
        )}
        {hostIdentity && (
          <p className="text-xs text-gray-500">
            Host: {hostIdentity}
          </p>
        )}
        {internalRecordingError && (
          <p className="text-xs text-rose-600">{internalRecordingError}</p>
        )}
      </div>
            </div>
  );
}

function ShareScreenToggleButton({ onError }: { onError: (message: string | null) => void }) {
  const { localParticipant } = useLocalParticipant();
  const screenTracks = useTracks([Track.Source.ScreenShare], { onlySubscribed: false });
  const [isProcessing, setIsProcessing] = useState(false);

  const localIdentity = localParticipant?.identity;
  const isSharing = useMemo(
    () =>
      screenTracks.some(
        (trackRef) =>
          isTrackReference(trackRef) && trackRef.participant.identity === localIdentity
      ),
    [screenTracks, localIdentity]
  );

  const toggleShare = useCallback(async () => {
    if (!localParticipant) return;
    setIsProcessing(true);
    try {
      if (isSharing) {
        await localParticipant.setScreenShareEnabled(false);
      } else {
        await localParticipant.setScreenShareEnabled(true, { audio: true });
      }
      onError(null);
    } catch (error) {
      const domError = error as DOMException;
      if (domError?.name === "NotAllowedError") {
        onError("Bạn đã từ chối quyền chia sẻ màn hình.");
      } else if (domError?.name === "AbortError") {
        onError("Đã huỷ thao tác chia sẻ màn hình.");
      } else {
        onError(
          error instanceof Error
            ? error.message
            : "Không thể bật chia sẻ màn hình."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isSharing, localParticipant, onError]);

  return (
    <button
      type="button"
      onClick={toggleShare}
      disabled={!localParticipant || isProcessing}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-60",
        isSharing
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border border-gray-200 bg-white text-gray-800"
      )}
    >
      <Share2 className="w-4 h-4" />
      {isProcessing
        ? "Đang xử lý..."
        : isSharing
        ? "Stop Sharing"
        : "Share Screen"}
    </button>
  );
}

function MeetingStage() {
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
    onlySubscribed: false,
  });
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  });

  const presenterTrack = screenTracks.find(isTrackReference);

  const participantCount = useMemo(() => {
    const identities = new Set<string>();
    cameraTracks.forEach((ref) => {
      if (ref.participant?.identity) identities.add(ref.participant.identity);
    });
    screenTracks.forEach((ref) => {
      if (ref.participant?.identity) identities.add(ref.participant.identity);
    });
    return identities.size;
  }, [cameraTracks, screenTracks]);

  const getDisplayName = (participant?: { name?: string | null; identity?: string }) =>
    participant?.name?.trim() || participant?.identity || "Thành viên";

  return (
    <div className="space-y-4">
      <RoomAudioRenderer />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Live Stage</h2>
          <p className="text-xs text-gray-500">
            Theo dõi nội dung chia sẻ trực tiếp từ các thành viên theo thời gian thực.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {participantCount} người tham gia
        </span>
        </div>

      <div className="relative aspect-video overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
        {presenterTrack ? (
          <>
            <div className="absolute inset-0">
              <ParticipantTile
                trackRef={presenterTrack}
                className="h-full w-full !border-none [&>video]:h-full [&>video]:w-full [&>video]:object-contain"
              />
            </div>
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-rose-500/90 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
              <Share2 className="h-3.5 w-3.5" />
              Đang chia sẻ màn hình
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
              <p className="text-sm font-semibold">
                {getDisplayName(presenterTrack.participant) ?? "Thành viên"}
              </p>
              <p className="text-xs text-white/70">
                {presenterTrack.participant?.isLocal ? "Bạn đang trình chiếu" : "Đang trình chiếu cho cả đội"}
              </p>
            </div>
          </>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center text-white">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Share2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Chưa có ai chia sẻ màn hình</p>
              <p className="mt-1 text-xs text-white/60">
                Bấm “Share Screen” để bắt đầu trình chiếu nội dung cho thành viên khác.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type RecorderStatus = "idle" | "recording" | "stopping";

interface RoomAudioRecorderOptions {
  onRecordingReady?: (result: RecordingResult) => void;
  onRecordingError?: (message: string) => void;
}

function useRoomAudioRecorder({
  onRecordingReady,
  onRecordingError,
}: RoomAudioRecorderOptions) {
  const room = useRoomContext();
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const mixedStreamRef = useRef<MediaStream | null>(null);
  const trackIdsRef = useRef<Set<string>>(new Set());
  const stopPromiseRef = useRef<{
    resolve: (value: RecordingResult | null) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const statusRef = useRef<RecorderStatus>("idle");

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const channelChunksRef = useRef<Float32Array[][]>([]);
  const totalSamplesRef = useRef<number>(0);
  const sampleRateRef = useRef<number>(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const ensureStream = useCallback(() => {
    if (!mixedStreamRef.current) {
      mixedStreamRef.current = new MediaStream();
    }
    return mixedStreamRef.current;
  }, []);

  const addTrackToStream = useCallback(
    (mediaStreamTrack: MediaStreamTrack | null | undefined) => {
      if (!mediaStreamTrack) return;
      const stream = ensureStream();
      if (trackIdsRef.current.has(mediaStreamTrack.id)) {
        return;
      }
      stream.addTrack(mediaStreamTrack);
      trackIdsRef.current.add(mediaStreamTrack.id);
    },
    [ensureStream]
  );

  const removeTrackFromStream = useCallback((mediaStreamTrack: MediaStreamTrack | null | undefined) => {
    if (!mediaStreamTrack) return;
    const stream = mixedStreamRef.current;
    if (!stream) return;
    stream.removeTrack(mediaStreamTrack);
    trackIdsRef.current.delete(mediaStreamTrack.id);
  }, []);

  const addLocalParticipantTracks = useCallback(
    (participant?: LocalParticipant | null) => {
      if (!participant) return;
      participant.audioTrackPublications.forEach((publication: LocalTrackPublication) => {
        const track = publication.track;
        if (track?.mediaStreamTrack) {
          addTrackToStream(track.mediaStreamTrack);
        }
      });
    },
    [addTrackToStream]
  );

  const addRemoteParticipantTracks = useCallback(
    (participant?: RemoteParticipant | null) => {
      if (!participant) return;
      participant.audioTrackPublications.forEach((publication: RemoteTrackPublication) => {
        const track = publication.track;
        if (track?.mediaStreamTrack) {
          addTrackToStream(track.mediaStreamTrack);
        }
      });
    },
    [addTrackToStream]
  );

  const hydrateExistingTracks = useCallback(() => {
    if (!room) return;
    addLocalParticipantTracks(room.localParticipant ?? null);
    room.remoteParticipants.forEach((participant: RemoteParticipant) => {
      addRemoteParticipantTracks(participant);
    });
  }, [addLocalParticipantTracks, addRemoteParticipantTracks, room]);

  useEffect(() => {
    if (!room) {
      return;
    }

    hydrateExistingTracks();

    const handleTrackSubscribed = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        addTrackToStream(track.mediaStreamTrack ?? null);
      }
    };

    const handleTrackUnsubscribed = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        removeTrackFromStream(track.mediaStreamTrack ?? null);
      }
    };

    const handleLocalPublished = (publication: LocalTrackPublication) => {
      if (publication.kind === Track.Kind.Audio) {
        const track = publication.track;
        if (track?.mediaStreamTrack) {
          addTrackToStream(track.mediaStreamTrack);
        }
      }
    };

    const handleLocalUnpublished = (publication: LocalTrackPublication) => {
      if (publication.kind === Track.Kind.Audio) {
        const track = publication.track;
        if (track?.mediaStreamTrack) {
          removeTrackFromStream(track.mediaStreamTrack);
        }
      }
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      participant.audioTrackPublications.forEach((publication: RemoteTrackPublication) => {
        const track = publication.track;
        if (track?.mediaStreamTrack) {
          removeTrackFromStream(track.mediaStreamTrack);
        }
      });
    };

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.on(RoomEvent.LocalTrackPublished, handleLocalPublished);
    room.on(RoomEvent.LocalTrackUnpublished, handleLocalUnpublished);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.LocalTrackPublished, handleLocalPublished);
      room.off(RoomEvent.LocalTrackUnpublished, handleLocalUnpublished);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      trackIdsRef.current.clear();
    };
  }, [
    addTrackToStream,
    hydrateExistingTracks,
    removeTrackFromStream,
    room,
  ]);

  const startRecording = useCallback(async () => {
    if (!room) {
      throw new Error("Phiên họp chưa sẵn sàng.");
    }

    const stream = ensureStream();
    const tracks = stream.getAudioTracks();
    if (!tracks.length) {
      const message = "Không tìm thấy audio track trong cuộc họp.";
      setError(message);
      onRecordingError?.(message);
      throw new Error(message);
    }

    const AudioContextConstructor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      const message = "Trình duyệt của bạn không hỗ trợ AudioContext.";
      setError(message);
      onRecordingError?.(message);
      throw new Error(message);
    }

    if (statusRef.current === "recording") {
      return;
    }

    const audioContext = new AudioContextConstructor();
    audioContextRef.current = audioContext;
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const sourceNode = audioContext.createMediaStreamSource(stream);
    sourceNodeRef.current = sourceNode;

    const channelCount = Math.min(
      2,
      sourceNode.channelCount || tracks[0]?.getSettings()?.channelCount || 2
    );

    const processorNode = audioContext.createScriptProcessor(4096, channelCount, channelCount);
    processorNodeRef.current = processorNode;

    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    silentGainRef.current = silentGain;

    channelChunksRef.current = Array.from({ length: channelCount }, () => []);
    totalSamplesRef.current = 0;
    sampleRateRef.current = audioContext.sampleRate;
    startTimeRef.current = Date.now();

    processorNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      for (let channel = 0; channel < channelCount; channel += 1) {
        const chunk = inputBuffer.getChannelData(channel);
        channelChunksRef.current[channel].push(new Float32Array(chunk));
      }
      totalSamplesRef.current += inputBuffer.length;
    };

    sourceNode.connect(processorNode);
    processorNode.connect(silentGain);
    silentGain.connect(audioContext.destination);

    setStatus("recording");
    statusRef.current = "recording";
    setError(null);
  }, [ensureStream, onRecordingError, room]);

  const stopRecording = useCallback(async () => {
    if (statusRef.current !== "recording") {
      return null;
    }

    setStatus("stopping");
    statusRef.current = "stopping";

    return new Promise<RecordingResult | null>((resolve, reject) => {
      stopPromiseRef.current = { resolve, reject };

      const finalize = async () => {
        try {
          processorNodeRef.current?.disconnect();
          sourceNodeRef.current?.disconnect();
          silentGainRef.current?.disconnect();
        } catch {
          // ignore
        }

        const audioContext = audioContextRef.current;
        const sampleRate = sampleRateRef.current || audioContext?.sampleRate || 48000;
        const totalSamples = totalSamplesRef.current;

        if (!totalSamples) {
          const message = "Không có dữ liệu audio nào được ghi lại.";
          setError(message);
          onRecordingError?.(message);
          setStatus("idle");
          statusRef.current = "idle";
          stopPromiseRef.current?.resolve(null);
          stopPromiseRef.current = null;
          resolve(null);
          return;
        }

        const mergedChannels = channelChunksRef.current.map((chunks) =>
          mergeFloat32Chunks(chunks, totalSamples)
        );

        const wavBuffer = encodeWavFromChannels(mergedChannels, sampleRate);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        const durationMs = Math.round((totalSamples / sampleRate) * 1000);

        const payload: RecordingResult = {
          blob: wavBlob,
          mimeType: "audio/wav",
          originalMimeType: "audio/wav",
          durationMs,
          startedAt: startTimeRef.current,
        };

        channelChunksRef.current = [];
        totalSamplesRef.current = 0;
        sampleRateRef.current = 0;
        startTimeRef.current = null;

        try {
          await audioContext?.close();
        } catch {
          // ignore
        }

        audioContextRef.current = null;
        sourceNodeRef.current = null;
        processorNodeRef.current = null;
        silentGainRef.current = null;

        setStatus("idle");
        statusRef.current = "idle";
        setError(null);
        stopPromiseRef.current?.resolve(payload);
        stopPromiseRef.current = null;
        onRecordingReady?.(payload);
        resolve(payload);
      };

      finalize().catch((error) => {
        const message = error instanceof Error ? error.message : "Không thể dừng ghi âm.";
        setError(message);
        setStatus("idle");
        statusRef.current = "idle";
        onRecordingError?.(message);
        stopPromiseRef.current?.reject(error);
        stopPromiseRef.current = null;
        reject(error);
      });
    });
  }, [onRecordingError, onRecordingReady]);

  const resetRecording = useCallback(() => {
    try {
      processorNodeRef.current?.disconnect();
      sourceNodeRef.current?.disconnect();
      silentGainRef.current?.disconnect();
    } catch {
      // ignore
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
    }

    audioContextRef.current = null;
    sourceNodeRef.current = null;
    processorNodeRef.current = null;
    silentGainRef.current = null;

    channelChunksRef.current = [];
    totalSamplesRef.current = 0;
    sampleRateRef.current = 0;
    stopPromiseRef.current = null;
    startTimeRef.current = null;
    trackIdsRef.current.clear();
    mixedStreamRef.current = null;
    setStatus("idle");
    statusRef.current = "idle";
    setError(null);
  }, []);

  return {
    status,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}

const mergeFloat32Chunks = (chunks: Float32Array[], totalLength: number) => {
  const merged = new Float32Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });
  return merged;
};

const encodeWavFromChannels = (channels: Float32Array[], sampleRate: number): ArrayBuffer => {
  const sanitizedChannels = channels.length > 0 ? channels : [new Float32Array(0)];
  const numChannels = Math.max(1, sanitizedChannels.length);
  const length = sanitizedChannels[0]?.length ?? 0;

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + length * blockAlign);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length * blockAlign, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, length * blockAlign, true);

  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const channelData = sanitizedChannels[channel] ?? sanitizedChannels[0];
      const sample = channelData?.[i] ?? 0;
      const clamped = Math.max(-1, Math.min(1, sample));
      const offset = 44 + (i * numChannels + channel) * bytesPerSample;
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    }
  }

  return buffer;
};

const writeString = (view: DataView, offset: number, text: string) => {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
};

const determineFileExtension = (mimeType: string) => {
  const lower = mimeType.toLowerCase();
  if (lower.includes("wav")) return "wav";
  if (lower.includes("mpeg")) return "mp3";
  if (lower.includes("mp4")) return "m4a";
  if (lower.includes("ogg")) return "ogg";
  return "webm";
};

const formatDuration = (durationMs: number) => {
  if (!Number.isFinite(durationMs)) return "0:00";
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatFileSize = (size: number) => {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let readableSize = size;
  while (readableSize >= 1024 && unitIndex < units.length - 1) {
    readableSize /= 1024;
    unitIndex += 1;
  }
  return `${readableSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};
