"use client";

import { Button } from "@/components/ui/button";
import { FileText, Mail, X, CheckCircle2, AlertCircle } from "lucide-react";
import React from "react";
import { MeetingsApi } from "@/lib/api/meeting";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SendMinuteModal({
  isOpen,
  onClose,
  minuteId,
  fileName,
  projectName,
  meetingTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  minuteId: number;
  fileName?: string;
  projectName?: string;
  meetingTitle?: string;
}) {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  // Toast states
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [showErrorToast, setShowErrorToast] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Toast helper functions
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessToast(true);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
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

  React.useEffect(() => {
    if (!isOpen) return;
    setSubject(
      `Meeting Minutes: ${meetingTitle ?? ""}${projectName ? ` — ${projectName}` : ""}`
    );

    setMessage(
      `Hi team,
Please find attached the meeting minutes from our ${meetingTitle ?? "recent"
      } session.`
    );
  }, [isOpen, meetingTitle, projectName]);

  const [recipientInput, setRecipientInput] = React.useState("");
  const [recipientEmails, setRecipientEmails] = React.useState<string[]>([]);
  const [recipientError, setRecipientError] = React.useState<string | null>(
    null
  );

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const [sending, setSending] = React.useState(false);

  const pushEmails = (raw: string) => {
    if (!raw) return;

    // Split by comma, space, or newline
    const candidates = raw
      .split(/[,\s\n]+/g)
      .map((e) => e.trim())
      .filter(Boolean);

    if (candidates.length === 0) return;

    const invalid = candidates.filter((e) => !isValidEmail(e));
    if (invalid.length > 0) {
      setRecipientError(`Invalid email: ${invalid.join(", ")}`);
      return;
    }

    setRecipientError(null);

    setRecipientEmails((prev) => {
      const merged = new Set(prev);
      candidates.forEach((e) => merged.add(e));
      return Array.from(merged);
    });
    setRecipientInput("");
  };

  const removeEmail = (email: string) => {
    setRecipientEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleRecipientsKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      pushEmails(recipientInput);
    }
  };

  const handleRecipientsBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    if (recipientInput.trim()) pushEmails(recipientInput);
  };

  const handleSendEmail = async () => {
    try {
      // // đảm bảo có ít nhất 1 email
      // if (recipientEmails.length === 0) {
      //   setRecipientError("Please enter at least one recipient email.");
      //   return;
      // }
      // đảm bảo có file đính kèm
      if (!selectedFile) {
        showError("Please select a file to attach.");
        return;
      }
      setSending(true);

      await MeetingsApi.sendEmail(minuteId, {
        // recipientEmails,
        subject,
        message,
        attachment: selectedFile,
      });

      showSuccess("Email sent successfully!");

      // Reset and close after a short delay
      setTimeout(() => {
        setSelectedFile(null);
        setRecipientEmails([]);
        setRecipientInput("");
        onClose();
      }, 3000);
    } catch (e) {
      console.error(e);
      const anyErr = e as any;
      const msg = anyErr?.response?.data?.message || anyErr?.message || "Failed to send email. Please try again.";
      showError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal
      role="dialog"
    >
      {/* Toast Success */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Toast Error */}
      {showErrorToast && (
        <div className="fixed top-4 right-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-start justify-between sticky top-0 z-20 rounded-t-2xl border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Send Meeting Minute</h2>
            </div>
            <p className="text-white/70 text-sm">
              Share MoM via email
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

            <p className="text-sm text-gray-500 mt-1">
              The system will automatically send to all members from the project.
            </p>

            {/* <div className="w-full border border-gray-200 rounded-lg p-2">
              <div className="flex flex-wrap gap-2">
                {recipientEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-sm"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={handleRecipientsKeyDown}
                  onBlur={handleRecipientsBlur}
                  placeholder={
                    recipientEmails.length === 0
                      ? "Type email and press Enter / comma"
                      : "Add more recipients…"
                  }
                  className="flex-1 min-w-[200px] outline-none text-sm p-1 placeholder:text-gray-400"
                />
              </div>
            </div>
            {recipientError && (
              <p className="text-sm text-red-600 mt-1">{recipientError}</p>
            )}
            {recipientEmails.length === 0 && !recipientError && (
              <p className="text-sm text-gray-500 mt-1">
                You can paste multiple emails separated by comma or whitespace.
              </p>
            )} */}
          </div>

          {/* Subject */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
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
              className="w-full p-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors min-h-32"
            />
            <p className="text-sm text-gray-500 mt-2">
              Please select a file to attach below.
            </p>
          </div>

          {/* Attachment */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-900 mb-3">
              Attachment
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/90 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
              />
              {selectedFile && (
                <div className="mt-3 flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-gray-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6 bg-transparent"
            disabled={sending}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            className="bg-black hover:bg-black/90 px-6 text-white"
            disabled={sending}
          >
            <Mail className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </div>
    </div>
  );
}