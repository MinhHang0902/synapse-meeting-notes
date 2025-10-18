import { Badge } from "@/components/ui/badge"

type Props = {
    project: {
        name: string,
        description: string,
        fullDescription: string,
        createdDate: string,
        status: string,
        managers: string[],
        reviewers: string[],
        viewers: string[],
    },
    recentActivity: {
        id: number,
        type: string,
        user?: string,
        action: string,
        item?: string,
        time: string,
    }[],
}

export default function ProjectOverview({ project, recentActivity }: Props) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case "file":
                return "📄"
            case "mom":
                return "📋"
            case "member":
                return "👤"
            case "action":
                return "📝"
            default:
                return "•"
        }
    }

    return (
        <div className="grid grid-cols-3 gap-6">
            {/* Project Information */}
            <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">ℹ</span>
                    Project Information
                </h2>

                <div className="space-y-6">
                    {/* Project Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600 font-medium">Project Name</label>
                            <p className="text-foreground mt-1">{project.name}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm text-gray-600 font-medium">Description</label>
                        <p className="text-foreground mt-1">{project.fullDescription}</p>
                    </div>

                    {/* Created Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600 font-medium">Created Date</label>
                            <p className="text-foreground mt-1">{project.createdDate}</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600 font-medium">Status</label>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-foreground">{project.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Managers */}
                    <div>
                        <label className="text-sm text-gray-600 font-medium">Manager(s)</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {project.managers.map((manager) => (
                                <Badge key={manager} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    {manager}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Reviewers */}
                    <div>
                        <label className="text-sm text-gray-600 font-medium">Reviewer(s)</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {project.reviewers.map((reviewer) => (
                                <Badge key={reviewer} className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                                    {reviewer}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Viewers */}
                    <div>
                        <label className="text-sm text-gray-600 font-medium">Viewer(s)</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {project.viewers.map((viewer) => (
                                <Badge key={viewer} className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                                    {viewer}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">⏱</span>
                    Recent Activity
                </h2>

                <div className="space-y-4">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="pb-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex gap-3">
                                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">
                                        {activity.user && <span className="font-medium">{activity.user}</span>}
                                        {activity.user && activity.action && " "}
                                        {activity.action}
                                        {activity.item && <span className="font-medium"> "{activity.item}"</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}