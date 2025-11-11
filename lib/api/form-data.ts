import { ProcessMeetingMinuteRequest } from "@/types/interfaces/meeting";

export function buildProcessFormData(payload: ProcessMeetingMinuteRequest): FormData {
    const fd = new FormData();

    const { files } = payload;
    if (Array.isArray(files)) {
        files.forEach((f) => {
            fd.append("files", f);
        });
    } else if (files) {
        fd.append("files", files);
    }

    if (payload.language) fd.append("language", payload.language);
    fd.append("project_id", String(payload.project_id));
    if (payload.source) fd.append("source", payload.source);
    if (payload.meeting_link) fd.append("meeting_link", payload.meeting_link);
    if (payload.location) fd.append("location", payload.location);

    const start =
        typeof payload.actual_start === "string"
            ? payload.actual_start
            : payload.actual_start.toISOString();
    const end =
        typeof payload.actual_end === "string"
            ? payload.actual_end
            : payload.actual_end.toISOString();

    fd.append("actual_start", start);
    fd.append("actual_end", end);

    return fd;
}