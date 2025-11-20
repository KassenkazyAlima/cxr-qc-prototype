// src/components/AdminUsersPage.tsx
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type AdminUser = {
  id: number;
  username: string;
  full_name: string;
  role: string;
  created_at?: string;
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/admin/users/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items: AdminUser[] = Array.isArray(data)
        ? data
        : (data.items ?? data.results ?? []);
      setUsers(items);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Delete admin user "${user.username}"?`)) return;

    try {
      const res = await fetch(
        `${API_BASE}/admin/admin/users/${encodeURIComponent(user.id)}/`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed (${res.status}): ${txt}`);
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete user");
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="px-8 pl-10 py-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin users
            </h1>
            <p className="text-sm text-gray-600">
              Manage accounts that can access this console.
            </p>
          </header>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td className="px-6 py-6 text-red-600" colSpan={5}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && users.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      No admin users yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {u.username}
                      </td>
                      <td className="px-6 py-3">{u.full_name}</td>
                      <td className="px-6 py-3 uppercase text-xs text-gray-600">
                        {u.role}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          variant="link"
                          className="text-red-600"
                          onClick={() => handleDelete(u)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
