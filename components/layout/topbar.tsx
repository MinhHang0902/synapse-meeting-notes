import { Search, Globe } from "lucide-react";

export function TopBar() {
  return (
    <div className="h-[100px] px-8 lg:px-12">
      <div className="h-full flex items-center justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-2xl font-semibold leading-tight">Bảng điều khiển</h2>
          <span className="text-sm text-gray-500">
            Hiển thị KPI quan trọng và nhật ký hoạt động mới nhất
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-[380px] max-w-[50vw]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài, lịch hẹn, người dùng…"
              className="
                w-full h-9 pl-9 pr-4 text-sm
                bg-white text-gray-900 placeholder:text-gray-400
                border border-gray-200 rounded-lg
                focus:outline-none focus:border-gray-400
                transition-colors
              "
            />
          </div>

          <button className="flex items-center gap-2 text-sm px-3 h-9 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline text-gray-700">English</span>
          </button>
        </div>
      </div>
    </div>
  );
}