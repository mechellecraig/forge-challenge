import { supabase } from "./supabase";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  author_id: string | null;
  pinned: boolean;
  emailed: boolean;
  created_at: string;
  updated_at: string;
  // Joined from members
  author_name?: string | null;
};

/**
 * List all announcements, pinned first, newest first.
 * Includes the author's display name via a join on members.
 */
export async function listAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select(`
      id, title, body, author_id, pinned, emailed, created_at, updated_at,
      members:author_id ( name )
    `)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    author_id: row.author_id,
    pinned: row.pinned,
    emailed: row.emailed,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_name: row.members?.name ?? null,
  }));
}

export async function createAnnouncement(params: {
  title: string;
  body: string;
  pinned: boolean;
  emailed: boolean;
  author_id: string | null;
}): Promise<Announcement> {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: params.title.trim(),
      body: params.body.trim(),
      pinned: params.pinned,
      emailed: params.emailed,
      author_id: params.author_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Announcement;
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<Pick<Announcement, "title" | "body" | "pinned" | "emailed">>
): Promise<Announcement> {
  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Helper: "2 days ago" style formatting.
 */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;

  if (diffMs < min) return "just now";
  if (diffMs < hr) return `${Math.floor(diffMs / min)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hr)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}
