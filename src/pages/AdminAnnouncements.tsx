import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  relativeTime,
  type Announcement,
} from "../lib/announcements";
import { useAuth } from "../lib/auth";

export default function AdminAnnouncements() {
  const { member } = useAuth();
  const qc = useQueryClient();

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [emailAll, setEmailAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: listAnnouncements,
  });

  const createMut = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      resetForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateAnnouncement(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      resetForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  function resetForm() {
    setTitle("");
    setBody("");
    setPinned(false);
    setEmailAll(false);
    setEditingId(null);
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setTitle(a.title);
    setBody(a.body);
    setPinned(a.pinned);
    setEmailAll(false); // Don't re-email on edits
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      alert("Please enter both a title and a message.");
      return;
    }

    if (editingId) {
      updateMut.mutate({
        id: editingId,
        updates: { title: title.trim(), body: body.trim(), pinned },
      });
    } else {
      createMut.mutate({
        title: title.trim(),
        body: body.trim(),
        pinned,
        emailed: emailAll, // Tracks intent; see Path B note in the setup doc
        author_id: member?.id ?? null,
      });
    }
  }

  function handleDelete(id: string, title: string) {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMut.mutate(id);
    }
  }

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Edit announcement" : "New announcement"}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g., Week 5 Challenge Announcement"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Write your announcement here. Line breaks are preserved."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              Pin to top
            </label>

            {!editingId && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={emailAll}
                  onChange={(e) => setEmailAll(e.target.checked)}
                />
                Email all participants
              </label>
            )}
          </div>

          {emailAll && !editingId && (
            <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
              <strong>Reminder:</strong> This app flags the announcement as
              "email sent" but doesn't send the email itself. After posting,
              send a matching email from Gmail to your participant list. (You
              can automate this later with a Supabase Edge Function if it
              becomes frequent.)
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={busy}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {busy
                ? "Saving…"
                : editingId
                ? "Save changes"
                : "Post announcement"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Existing list */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          All announcements ({announcements.length})
        </h3>

        {announcements.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No announcements posted yet.
          </p>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-gray-200 rounded p-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && (
                      <span className="text-xs text-orange-600">📌</span>
                    )}
                    <span className="font-medium truncate">{a.title}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {a.author_name ? `${a.author_name} · ` : ""}
                    {relativeTime(a.created_at)}
                    {a.emailed && " · emailed"}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(a)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.title)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
