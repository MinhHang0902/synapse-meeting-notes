import ProtectedLayout from "@/components/layouts/ProtectedLayout";

export default function GuidancePage() {
  return (
    <ProtectedLayout>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              🧭 User Guidance: Smart Meeting Notes AI
            </h1>
            <p className="text-gray-600 mb-8">
              Welcome to <span className="font-semibold">Smart Meeting Notes AI</span> — your intelligent assistant for automating
              meeting documentation and insight generation. Follow this guide to get started and make the most out of the platform.
            </p>

            <div className="space-y-10">
              {/* 1. Accessing Your Workspace */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">1️⃣ Accessing Your Workspace</h2>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                  <li>Log in using your company account or assigned credentials.</li>
                  <li>
                    Each organization has its own secure workspace with <span className="font-medium">role-based access control</span>:
                    <ul className="list-[circle] pl-6 mt-2 space-y-1">
                      <li><span className="font-medium">Managers</span> can create meetings, upload files, and approve reports.</li>
                      <li><span className="font-medium">Members</span> can view meeting notes, summaries, and assigned action items.</li>
                      <li><span className="font-medium">Viewers</span> can only read finalized summaries and reports.</li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* 2. Starting a New Meeting */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">2️⃣ Starting a New Meeting</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You can create a new meeting record in one of three ways:
                </p>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                  <li><span className="font-medium">Upload a recorded file</span> (<code>.mp3</code>, <code>.wav</code>, or <code>.m4a</code>)</li>
                  <li><span className="font-medium">Import an existing transcript</span> (text or <code>.vtt</code> format)</li>
                  <li><span className="font-medium">Record directly</span> in your browser using the built-in meeting recorder</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Once uploaded, the system automatically detects the meeting language and initiates <span className="font-medium">AI transcription</span> in the background.
                </p>
              </section>

              {/* 3. Viewing and Managing Transcripts */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">3️⃣ Viewing and Managing Transcripts</h2>
                <p className="text-gray-700 leading-relaxed mb-3">After processing, you can:</p>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                  <li>View the <span className="font-medium">full transcript</span> with timestamps and speaker turns</li>
                  <li>Highlight or comment on specific segments</li>
                  <li>Correct minor transcription errors if necessary</li>
                  <li>Switch between <span className="font-medium">original language</span> and <span className="font-medium">AI-translated text</span> (e.g., English ⇄ Vietnamese)</li>
                </ul>
              </section>

              {/* 4. Generating AI Summaries */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">4️⃣ Generating AI Summaries</h2>
                <p className="text-gray-700 leading-relaxed">
                  Click <span className="font-medium">“Generate Summary”</span> to transform your transcript into a structured meeting report.
                  The platform automatically extracts and formats content into the following sections:
                </p>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed mt-3 space-y-2">
                  <li><span className="font-medium">Meeting Summary</span> – concise overview of main topics and outcomes</li>
                  <li><span className="font-medium">Key Decisions</span> – decisions made during the meeting</li>
                  <li><span className="font-medium">Action Items</span> – follow-up tasks and assigned responsibilities</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Reports are stored securely and can be exported as <span className="font-medium">PDF</span>, <span className="font-medium">DOCX</span>, or shared via link.
                </p>
              </section>

              {/* 5. Integrations */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">5️⃣ Integrating with Team Tools</h2>
                <p className="text-gray-700 leading-relaxed">Smart Meeting Notes AI integrates seamlessly with:</p>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed mt-3 space-y-2">
                  <li>🧩 <span className="font-medium">Slack</span> — push AI summaries or decisions to designated team channels</li>
                  <li>✅ <span className="font-medium">Trello</span> — sync action items as cards for tracking progress</li>
                  <li>📨 <span className="font-medium">Email</span> — automatically send summaries to meeting participants</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Integration can be enabled from <span className="font-medium">Settings → Integrations</span>.
                </p>
              </section>

              {/* 6. Collaboration */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">6️⃣ Collaborating & Reviewing</h2>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                  <li>Team members can review, comment, and edit generated summaries.</li>
                  <li>Managers can <span className="font-medium">approve or lock</span> finalized reports for organization-wide visibility.</li>
                  <li>Version history is maintained for audit and compliance.</li>
                </ul>
              </section>

              {/* 7. Security */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">7️⃣ Security & Access Control</h2>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                  <li>All meeting data is encrypted and stored securely.</li>
                  <li>Role-based permissions ensure only authorized users can access sensitive content.</li>
                  <li>Administrators can manage team roles and data retention settings in <span className="font-medium">Admin Panel → User Management</span>.</li>
                </ul>
              </section>

              {/* 8. Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">8️⃣ Tips for Best Results</h2>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                  <li>Use a clear, noise-free recording for optimal transcription accuracy.</li>
                  <li>Keep speakers identifiable (introduce names when possible).</li>
                  <li>For bilingual meetings, enable <span className="font-medium">auto-translation mode</span> in meeting settings.</li>
                  <li>Review AI summaries periodically to fine-tune your organization’s custom report format.</li>
                </ul>
              </section>

              {/* 9. Support */}
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">9️⃣ Getting Support</h2>
                <ul className="list-disc pl-6 text-gray-700 leading-relaxed space-y-2">
                  <li>Visit the <span className="font-medium">Help Center</span> or <span className="font-medium">FAQs</span> within the app.</li>
                  <li>Contact your organization’s workspace admin.</li>
                  <li>
                    Or email the support team:
                    {" "}
                    <a href="mailto:support@synapse.ai" className="text-indigo-600 hover:text-indigo-700 underline">
                      support@synapse.ai
                    </a>
                  </li>
                </ul>
              </section>

              {/* Reminder */}
              <section className="border-t pt-6">
                <p className="text-gray-800 leading-relaxed">
                  💡 <span className="font-semibold">Remember:</span> Smart Meeting Notes AI isn’t just a transcription tool — it’s your team’s
                  knowledge hub. Every meeting becomes a <span className="font-medium">searchable, shareable, and actionable</span> record of progress.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}
