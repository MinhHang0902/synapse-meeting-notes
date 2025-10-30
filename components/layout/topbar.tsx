import { Search, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export function TopBar() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { code: "en", label: "English" },
    { code: "vi", label: "Vietnamese" }
  ];

  return (
    <div className="h-[100px] px-8 lg:px-12">
      <div className="h-full flex items-center justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-2xl font-semibold leading-tight">Dashboard</h2>
          <span className="text-sm text-gray-500">
            Display key KPIs and latest activity logs
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-[380px] max-w-[50vw]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, appointments, users…"
              className="
                w-full h-9 pl-9 pr-4 text-sm
                bg-white text-gray-900 placeholder:text-gray-400
                border border-gray-200 rounded-lg
                focus:outline-none focus:border-gray-400
                transition-colors
              "
            />
          </div>

          <div className="min-w-[140px]">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="h-9 w-full border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <SelectValue className="text-gray-700">
                    {selectedLanguage}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent
                align="end"
                className="min-w-0 w-[var(--radix-select-trigger-width)] max-w-none"
              >
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.label}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}