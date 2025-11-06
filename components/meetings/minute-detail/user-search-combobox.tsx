"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { UsersApi } from "@/lib/api/user";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  user_id: number;
  name: string;
  email: string;
}

interface Props {
  onSelect: (user: { userId: number; name: string; email: string }) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSearchCombobox({
  onSelect,
  placeholder = "Search users...",
  className = "",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedSearch.trim().length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await UsersApi.getAll({
          search: debouncedSearch,
          pageSize: 10,
        });
        setUsers(response.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch]);

  const handleSelect = (user: User) => {
    onSelect({
      userId: user.user_id,
      name: user.name,
      email: user.email,
    });
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setOpen(false), 200);
          }}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
        />
      </div>

      {open && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Loading...
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No users found.
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="py-1">
              {users.map((user) => (
                <button
                  key={user.user_id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(user);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

