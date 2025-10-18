"use client";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;      // initials
  avatarColor: string; // tailwind color class
};

export default function ProjectMembers({ teamMembers }: { teamMembers: Member[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">People with</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((m) => (
          <div key={m.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-semibold ${m.avatarColor}`}>
                {m.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{m.name}</div>
                <div className="text-xs text-gray-500 truncate">{m.email}</div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs">
              {m.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
