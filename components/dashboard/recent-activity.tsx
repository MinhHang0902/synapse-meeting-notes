import { Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";

const activities = [
  {
    id: 1,
    title: "New MoM Generated",
    description:
      'Successfully generated meeting minutes for "Q1 Strategy Review" with 12 action items and 3 key decisions',
    time: "5 minutes ago",
    user: "You",
  },
  {
    id: 2,
    title: "New Version in Project",
    description:
      '"Budget Proposal v2.1.pdf" uploaded to "Financial Planning 2024" project',
    time: "18 minutes ago",
    user: "Sarah J.",
  },
  {
    id: 3,
    title: "Action Item Completed",
    description:
      '"Prepare vendor comparison" marked as complete in "Procurement Review"',
    time: "1 hour ago",
    user: "Procurement Team",
  },
  {
    id: 4,
    title: "New Team Member",
    description:
      'Michael Chen joined "Product Launch Q2" project as Technical Reviewer',
    time: "3 hours ago",
    user: "Michael C.",
  },
  {
    id: 5,
    title: "Key Decision Made",
    description:
      'Approved $150k budget for "Mobile App Redesign" in "Tech Strategy"',
    time: "Yesterday 14:30",
    user: "Executive Team",
  },
];

export function RecentActivity({ embedded = false }: { embedded?: boolean }) {
  const wrapperClass = embedded
    ? "p-0 bg-transparent border-0 shadow-none"
    : "p-6 bg-white rounded-2xl border border-gray-200 shadow-sm";

  return (
    <Card className={wrapperClass}>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-semibold text-sm text-gray-900 mb-1">
              {activity.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {activity.user}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
