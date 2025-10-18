import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Upload } from "lucide-react";

type Props = {
    meetingMinutes: {
        id: number,
        fileName: string,
        uploader: string,
        uploadDate: string,
        fileType: string,
    }[],
}

export default function ProjectMinutes({ meetingMinutes }: Props) {
    const getFileIconColor = (fileType: string) => {
        switch (fileType) {
            case "pdf":
                return "bg-red-500"
            case "excel":
                return "bg-green-500"
            case "word":
                return "bg-blue-500"
            case "powerpoint":
                return "bg-orange-500"
            case "image":
                return "bg-purple-500"
            default:
                return "bg-gray-500"
        }
    }

    const getFileIconLetter = (fileType: string) => {
        switch (fileType) {
            case "pdf":
                return "P"
            case "excel":
                return "E"
            case "word":
                return "W"
            case "powerpoint":
                return "P"
            case "image":
                return "I"
            default:
                return "F"
        }
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText size={20} />
                    Project Meeting Minutes
                </h2>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Upload size={18} />
                    Upload Minutes
                </Button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">File Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Uploader</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Upload Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetingMinutes.map((file) => (
                            <tr key={file.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded flex items-center justify-center text-white text-sm font-semibold ${getFileIconColor(file.fileType)}`}
                                        >
                                            {getFileIconLetter(file.fileType)}
                                        </div>
                                        <span className="text-sm text-foreground font-medium">{file.fileName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{file.uploader}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{file.uploadDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight size={18} className="text-gray-600" />
                </button>
                <button className="w-8 h-8 rounded bg-gray-800 text-white text-sm font-semibold">1</button>
                <button className="w-8 h-8 rounded hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors">
                    2
                </button>
                <button className="w-8 h-8 rounded hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors">
                    3
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight size={18} className="text-gray-600 rotate-180" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight size={18} className="text-gray-600 rotate-180" />
                </button>
            </div>
        </div>
    )
}