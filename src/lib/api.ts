import { supabase } from "./supabase";
import { calcDayPoints, DEFAULT_SCORING, ScoringConfig } from "./points";
export type { ScoringConfig };

export type Team = { id: string; name: string };
export type Member = { id: string; team_id: string; name: string; age: number; user_id: string | null; is_admin?: boolean };
export type Log = {
  id?: string; member_id: string; week: number; day_index: number;
  walk: number; run: number; bike: number; meal_plan: boolean; avg_hr: number;
};
export type Bonus = { id: string; team_id: string; week: number; points: number; description: string };
export type LeaderboardEntry = {
  teamId: string; teamName: string; memberCount: number;
  activityPoints: number; bonusPoints: number; totalPoints: number; rank: number;
};
export type Summary = {
  totalMembers: number; totalTeams: number; currentWeek: number;
  totalLogsThisWeek: number; totalMiles: number; topTeam: string | null;
};

// ── Teams ─────────────────────────────────────────────────────────────────────
export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from("teams").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createTeam(name: string): Promise<Team> {
  const { data, error } = await supabase.from("teams").insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function updateTeam(id: string, name: string): Promise<Team> {
  const { data, error } = await supabase.from("teams").update({ name }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw error;
}

// ── Members ───────────────────────────────────────────────────────────────────
export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from("members").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createMember(m: { name: string; team_id: string; age: number }): Promise<Member> {
  const { data, error } = await supabase.from("members").insert(m).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw error;
}

// ── Logs ──────────────────────────────────────────────────────────────────────
export async function getLogs(params?: { memberId?: string; week?: number }): Promise<Log[]> {
  let q = supabase.from("logs").select("*");
  if (params?.memberId) q = q.eq("member_id", params.memberId);
  if (params?.week) q = q.eq("week", params.week);
  const { data, error } = await q.order("week").order("day_index");
  if (error) throw error;
  return data;
}

export async function upsertLog(log: Omit<Log, "id">): Promise<void> {
  const { error } = await supabase
    .from("logs")
    .upsert(log, { onConflict: "member_id,week,day_index" });
  if (error) throw error;
}

export async function deleteLog(params: { memberId: string; week: number; dayIndex: number }): Promise<void> {
  const { error } = await supabase
    .from("logs")
    .delete()
    .eq("member_id", params.memberId)
    .eq("week", params.week)
    .eq("day_index", params.dayIndex);
  if (error) throw error;
}

// ── Bonuses ───────────────────────────────────────────────────────────────────
export async function getBonuses(): Promise<Bonus[]> {
  const { data, error } = await supabase.from("bonuses").select("*").order("week", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createBonus(b: { team_id: string; week: number; points: number; description: string }): Promise<Bonus> {
  const { data, error } = await supabase.from("bonuses").insert(b).select().single();
  if (error) throw error;
  return data;
}

export async function updateBonus(id: string, updates: { team_id?: string; week?: number; points?: number; description?: string }): Promise<Bonus> {
  const { data, error } = await supabase.from("bonuses").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBonus(id: string): Promise<void> {
  const { error } = await supabase.from("bonuses").delete().eq("id", id);
  if (error) throw error;
}

// ── Scoring config ────────────────────────────────────────────────────────────
const SCORING_KEYS = ["pts_walk_run", "pts_bike", "pts_meal_weekday", "pts_meal_weekend", "pts_hr_zone", "hrThreshold"];

export async function getScoringConfig(): Promise<ScoringConfig> {
  const { data } = await supabase.from("config").select("key, value").in("key", SCORING_KEYS);
  const map: Record<string, string> = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
  const p = (v: string | undefined, fallback: number) => { const n = parseFloat(v ?? ""); return isNaN(n) ? fallback : n; };
  const walkRun = p(map.pts_walk_run, DEFAULT_SCORING.walk);
  return {
    walk: walkRun,
    run: walkRun,
    bike: p(map.pts_bike, DEFAULT_SCORING.bike),
    meal_weekday: p(map.pts_meal_weekday, DEFAULT_SCORING.meal_weekday),
    meal_weekend: p(map.pts_meal_weekend, DEFAULT_SCORING.meal_weekend),
    hr_zone: p(map.pts_hr_zone, DEFAULT_SCORING.hr_zone),
    hr_threshold: p(map.hrThreshold, DEFAULT_SCORING.hr_threshold),
  };
}

export async function setScoringConfig(updates: {
  walk_run?: number; bike?: number; meal_weekday?: number;
  meal_weekend?: number; hr_zone?: number; hr_threshold?: number;
}): Promise<void> {
  const rows: { key: string; value: string }[] = [];
  if (updates.walk_run !== undefined) rows.push({ key: "pts_walk_run", value: String(updates.walk_run) });
  if (updates.bike !== undefined) rows.push({ key: "pts_bike", value: String(updates.bike) });
  if (updates.meal_weekday !== undefined) rows.push({ key: "pts_meal_weekday", value: String(updates.meal_weekday) });
  if (updates.meal_weekend !== undefined) rows.push({ key: "pts_meal_weekend", value: String(updates.meal_weekend) });
  if (updates.hr_zone !== undefined) rows.push({ key: "pts_hr_zone", value: String(updates.hr_zone) });
  if (updates.hr_threshold !== undefined) rows.push({ key: "hrThreshold", value: String(updates.hr_threshold) });
  if (rows.length === 0) return;
  for (const row of rows) {
    const { error } = await supabase.from("config").update({ value: row.value }).eq("key", row.key);
    if (error) throw error;
  }
}

// ── Admin PIN ─────────────────────────────────────────────────────────────────
export async function verifyPin(pin: string): Promise<boolean> {
  const { data, error } = await supabase.from("config").select("value").eq("key", "adminPin").single();
  if (error) throw error;
  return data.value === pin;
}

export async function changePin(currentPin: string, newPin: string): Promise<void> {
  const valid = await verifyPin(currentPin);
  if (!valid) throw new Error("Incorrect PIN");
  const { error } = await supabase.from("config").update({ value: newPin }).eq("key", "adminPin");
  if (error) throw error;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export async function getLeaderboard(week?: number): Promise<{ entries: LeaderboardEntry[] }> {
  const [teams, members, allLogs, allBonuses, scoring] = await Promise.all([
    getTeams(),
    getMembers(),
    week ? getLogs({ week }) : getLogs(),
    getBonuses(),
    getScoringConfig(),
  ]);

  const memberMap = new Map(members.map(m => [m.id, m]));

  // Member count per team
  const memberCount = new Map<string, number>();
  members.forEach(m => {
    memberCount.set(m.team_id, (memberCount.get(m.team_id) || 0) + 1);
  });

  // Activity points per member
  const memberActivity = new Map<string, number>();
  allLogs.forEach(log => {
    const member = memberMap.get(log.member_id);
    if (!member) return;
    const pts = calcDayPoints({
      walk: log.walk, run: log.run, bike: log.bike,
      meal_plan: log.meal_plan, avg_hr: log.avg_hr,
      day_index: log.day_index, age: member.age,
    }, scoring);
    memberActivity.set(log.member_id, (memberActivity.get(log.member_id) || 0) + pts);
  });

  // Team activity = average of all member points
  const teamActivity = new Map<string, number>();
  members.forEach(m => {
    teamActivity.set(m.team_id, (teamActivity.get(m.team_id) || 0) + (memberActivity.get(m.id) || 0));
  });
  new Set(members.map(m => m.team_id)).forEach(teamId => {
    const count = memberCount.get(teamId) || 1;
    teamActivity.set(teamId, (teamActivity.get(teamId) || 0) / count);
  });

  // Bonus points per team (filtered by week if provided)
  const teamBonus = new Map<string, number>();
  allBonuses
    .filter(b => !week || b.week === week)
    .forEach(b => {
      teamBonus.set(b.team_id, (teamBonus.get(b.team_id) || 0) + b.points);
    });

  const entries: LeaderboardEntry[] = teams.map(team => {
    const activityPoints = Math.round((teamActivity.get(team.id) || 0) * 10) / 10;
    const bonusPoints = teamBonus.get(team.id) || 0;
    return {
      teamId: team.id,
      teamName: team.name,
      memberCount: memberCount.get(team.id) || 0,
      activityPoints,
      bonusPoints,
      totalPoints: Math.round((activityPoints + bonusPoints) * 10) / 10,
      rank: 0,
    };
  });

  entries.sort((a, b) => b.totalPoints - a.totalPoints);
  entries.forEach((e, i) => { e.rank = i + 1; });

  return { entries };
}

// ── Summary ───────────────────────────────────────────────────────────────────
export async function getSummary(): Promise<Summary> {
  const [teams, members, allLogs, bonuses, scoring] = await Promise.all([
    getTeams(), getMembers(), getLogs(), getBonuses(), getScoringConfig(),
  ]);

  const currentWeek = allLogs.length > 0 ? Math.max(...allLogs.map(l => l.week)) : 1;
  const weekLogs = allLogs.filter(l => l.week === currentWeek);
  const totalMiles = Math.round(allLogs.reduce((s, l) => s + l.walk + l.run + l.bike, 0) * 10) / 10;

  // Find top team this week
  const memberMap = new Map(members.map(m => [m.id, m]));
  const teamPts = new Map<string, number>();
  weekLogs.forEach(log => {
    const member = memberMap.get(log.member_id);
    if (!member) return;
    const pts = calcDayPoints({
      walk: log.walk, run: log.run, bike: log.bike,
      meal_plan: log.meal_plan, avg_hr: log.avg_hr,
      day_index: log.day_index, age: member.age,
    }, scoring);
    teamPts.set(member.team_id, (teamPts.get(member.team_id) || 0) + pts);
  });
  bonuses.filter(b => b.week === currentWeek).forEach(b => {
    teamPts.set(b.team_id, (teamPts.get(b.team_id) || 0) + b.points);
  });

  let topTeam: string | null = null;
  let topPts = -1;
  teams.forEach(t => {
    const pts = teamPts.get(t.id) || 0;
    if (pts > topPts) { topPts = pts; topTeam = t.name; }
  });

  return {
    totalMembers: members.length,
    totalTeams: teams.length,
    currentWeek,
    totalLogsThisWeek: weekLogs.length,
    totalMiles,
    topTeam: topPts > 0 ? topTeam : null,
  };
}
