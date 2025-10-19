/* =========================
   Modal: SendMinuteModal
   ========================= */

import { Button } from "@/components/ui/button";
import { FileText, Mail, X } from "lucide-react";
import React from "react";

export default function SendMinuteModal({
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
                <span className="flex items-center gap-2">Send to all project members</span>
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