// components/meeting/meeting-list.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { MeetingsApi } from "@/lib/api/meeting";
import type { MeetingMinutesData, MeetingMinutesResponse } from "@/types/interfaces/meeting";
import { useLocale } from "next-intl";



export function MeetingMinutesList() {
  const router = useRouter();
  const locale = useLocale();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");

  const [list, setList] = useState<MeetingMinutesData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pageSize = 6;

  const DETAIL_BASE = `/${locale}/pages/meetings`;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res: MeetingMinutesResponse = await MeetingsApi.getAll({
          search: searchTerm || undefined,
          project_id: selectedProject !== "All Projects" ? selectedProject : undefined,
          pageIndex: currentPage,
          pageSize,
        });
        setList(res.data ?? []);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
      } catch (e) {
        console.error(e);
        setErr("Failed to load meeting minutes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchTerm, selectedProject, currentPage]);

  const projects = useMemo(() => {
    const set = new Set<string>(["All Projects"]);
    list.forEach((m) => set.add(m.project?.project_name ?? "Unknown Project"));
    return Array.from(set);
  }, [list]);

  const totalPages = Math.max(1, Math.ceil((total || list.length) / pageSize));

  const goFirst = () => setCurrentPage(1);
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setCurrentPage(totalPages);

  const goToDetail = (id: number | string) => {
    router.push(`${DETAIL_BASE}/${id}`);
  };

  const onTitleKeyDown = (e: React.KeyboardEvent, id: number | string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetail(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        <div className="relative md:col-span-8">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            aria-label="Search"
            placeholder="Search by title or project…"
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="h-9 pl-10 bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:border-gray-400"
          />
        </div>

        <div className="md:col-span-3">
          <Select
            value={selectedProject}
            onValueChange={(v) => {
              setCurrentPage(1);
              setSelectedProject(v);
            }}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue>{selectedProject}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {projects.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <Button className="h-9 w-full bg-black hover:bg-black/90 text-white">
            Apply
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-sm text-gray-500">Loading…</div>
        ) : err ? (
          <div className="text-center py-10 text-sm text-red-600">{err}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Title
                </th>
                <th className="px-4 md:px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Project
                </th>
                <th className="px-4 md:px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Created
                </th>
                <th className="px-4 md:px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((m) => (
                <tr key={m.minute_id} className="hover:bg-gray-50/50">
                  <td className="px-4 md:px-5 py-3">
                    {/* --- chỉ Title có điều hướng --- */}
                    <p
                      role="button"
                      tabIndex={0}
                      onClick={() => goToDetail(m.minute_id)}
                      onKeyDown={(e) => onTitleKeyDown(e, m.minute_id)}
                      title="Xem chi tiết"
                      className="font-medium text-gray-900 text-sm truncate cursor-pointer hover:underline focus:underline focus:outline-none"
                    >
                      {m.title}
                    </p>
                    <p className="text-xs text-gray-500">ID: {m.minute_id}</p>
                  </td>
                  <td className="px-4 md:px-5 py-3 text-sm font-medium text-gray-900">
                    {m.project?.project_name}
                  </td>
                  <td className="px-4 md:px-5 py-3 text-sm">
                    <div className="text-gray-900">
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 md:px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${(m.status || "").toLowerCase() === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    No meeting minutes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={goFirst}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goPrev}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 text-sm text-gray-700">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={goNext}
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={goLast}
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-gray-200/70 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
