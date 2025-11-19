import { MessageSquare, Video } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatsCardsProps = {
  embedded?: boolean;
  updatedText?: string; // default "Updated 8 minutes ago"
};

export function StatsCards({
  embedded = false,
  updatedText = "Updated 8 minutes ago",
}: StatsCardsProps) {
  const cardClass = embedded
    ? "p-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
    : "p-6";
  const RightIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
      <div className="text-gray-400">{children}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={cardClass}>
        <div className="flex items-start justify-between">
          <div className="pr-4">
            <h3 className="text-base font-semibold text-gray-900">
              Projects I'm participating in
            </h3>
            <p className="text-sm text-gray-500 mt-1">{updatedText}</p>
            <div className="text-5xl font-semibold text-gray-900 mt-6">14</div>
            <p className="text-sm text-gray-500 mt-6">Check now...</p>
          </div>
          <RightIcon>
            <MessageSquare className="w-7 h-7" />
          </RightIcon>
        </div>
      </Card>

      <Card className={cardClass}>
        <div className="flex items-start justify-between">
          <div className="pr-4">
            <h3 className="text-base font-semibold text-gray-900">
              Meetings Minutes (MoM)
            </h3>
            <p className="text-sm text-gray-500 mt-1">{updatedText}</p>
            <div className="text-5xl font-semibold text-gray-900 mt-6">23</div>
            <p className="text-sm text-gray-500 mt-6">Check now...</p>
          </div>

          <RightIcon>
            <Video className="w-7 h-7" />
          </RightIcon>
        </div>
      </Card>
    </div>
  );
}
