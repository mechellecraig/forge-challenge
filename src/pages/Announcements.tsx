import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAnnouncements, relativeTime } from "../lib/announcements";

const LAST_VIEWED_KEY = "forge_announcements_last_viewed";

/**
 * Mark announcements as read by storing the current timestamp.
 * Used by Layout.tsx to decide whether to show the unread dot.
 */
export function markAnnouncementsViewed() {
  localStorage.setItem(LAST_VIEWED_KEY, new Date().toISOString());
}

export function getLastViewed(): Date | null {
  const v = localStorage.getItem(LAST_VIEWED_KEY);
  return v ? new Date(v) : null;
}

export default function Announcements() {
  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ["announcements"],
    queryFn: listAnnouncements,
  });

  // Mark as viewed when the user lands on this page
  useEffect(() => {
    markAnnouncementsViewed();
  }, [announcements]);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading announcements…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Couldn't load announcements. Please refresh the page.
        </p>
      </div>
    );
  }

  const items = announcements ?? [];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-1">Announcements</h1>
      <p className="text-sm text-gray-500 mb-6">
        Updates and messages from the Ironworks team
      </p>

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            No announcements yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <article
              key={a.id}
              className={`bg-white border rounded-lg p-5 shadow-sm ${
                a.pinned ? "border-orange-300 bg-orange-50/30" : "border-gray-200"
              }`}
            >
              {a.pinned && (
                <div className="text-xs font-semibold text-orange-600 mb-2 flex items-center gap-1">
                  <span>📌</span>
                  <span>Pinned</span>
                </div>
              )}
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {a.title}
              </h2>
              <div className="text-xs text-gray-500 mb-3">
                {a.author_name ? `${a.author_name} · ` : ""}
                {relativeTime(a.created_at)}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {a.body}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
