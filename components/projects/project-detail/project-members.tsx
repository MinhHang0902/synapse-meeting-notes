import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit2, Trash2, Users } from "lucide-react";

type Props = {
    teamMembers: {
        id: number,
        name: string,
        email: string,
        role: string,
        avatar: string,
        avatarColor: string,
    }[],
}

export default function ProjectMembers({ teamMembers }: Props) {
    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case "Manager":
                return "bg-yellow-100 text-yellow-800"
            case "Reviewer":
                return "bg-blue-100 text-blue-700"
            case "Viewer":
                return "bg-gray-100 text-gray-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users size={20} />
                    Team Members
                </h2>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Users size={18} />
                    Add Member
                </Button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                    {teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-12 h-12 rounded-full ${member.avatarColor} flex items-center justify-center text-white font-semibold text-sm`}
                                >
                                    {member.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{member.name}</p>
                                    <p className="text-sm text-gray-600">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className={getRoleBadgeStyle(member.role)}>{member.role}</Badge>
                                <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                                    <Edit2 size={18} className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                                    <Trash2 size={18} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <button className="w-8 h-8 rounded bg-gray-800 text-white text-sm font-semibold">1</button>
                <button className="w-8 h-8 rounded hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors">
                    2
                </button>
                <button className="w-8 h-8 rounded hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors">
                    3
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight size={18} className="text-gray-600" />
                </button>
            </div>
        </div>
    )
}