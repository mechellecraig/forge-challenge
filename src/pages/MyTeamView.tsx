import { useQuery } from "@tanstack/react-query";
import { getTeams, getMembers, getLogs, getScoringConfig } from "@/lib/api";
import { calcDayPoints, DEFAULT_SCORING } from "@/lib/points";
import { useAuth } from "@/lib/auth";
import { Users, Shield } from "lucide-react";

export default function MyTeamView() {
  const { member } = useAuth();
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: allMembers, isLoading: loadingMembers } = useQuery({ queryKey: ["members"], queryFn: getMembers });
  const { data: allLogs, isLoading: loadingLogs } = useQuery({ queryKey: ["logs", "all"], queryFn: () => getLogs() });
  const { data: scoring = DEFAULT_SCORING } = useQuery({ queryKey: ["scoring"], queryFn: getScoringConfig });

  const isLoading = loadingMembers || loadingLogs;

  // User must be on a team
  if (!member) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/50 text-lg">Account not linked to a member yet.</p>
        <p className="text-white/30 text-sm mt-1">Contact your admin for help.</p>
      </div>
    );
  }

  if (!member.team_id) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/50 text-lg">You're not assigned to a team yet.</p>
        <p className="text-white/30 text-sm mt-1">Contact your admin.</p>
      </div>
    );
  }

  const myTeam = teams?.find(t => t.id === member.team_id);
  const teammates = (allMembers ?? []).filter(m => m.team_id === member.team_id);

  // Aggregate stats per teammate
  const stats = teammates.map(m => {
    const mLogs = (allLogs ?? []).filter(l => l.member_id === m.id);

    const total_points = mLogs.reduce((sum, log) => sum + calcDayPoints({
      walk: log.walk, run: log.run, bike: log.bike,
      meal_plan: log.meal_plan, avg_hr: log.avg_hr,
      day_index: log.day_index, age: m.age,
    }, scoring), 0);

    const walk = mLogs.reduce((s, l) => s + (Number(l.walk) || 0), 0);
    const run = mLogs.reduce((s, l) => s + (Number(l.run) || 0), 0);
    const bike = mLogs.reduce((s, l) => s + (Number(l.bike) || 0), 0);
    const meal_days = mLogs.filter(l => l.meal_plan).length;

    const hr_sessions = mLogs.filter(l => {
      const hr = Number(l.avg_hr) || 0;
      if (hr <= 0 || !m.age) return false;
      return hr >= (220 - m.age) * scoring.hr_threshold;
    }).length;

    return {
      id: m.id,
      name: m.name,
      age: m.age,
      total_points: Math.round(total_points * 10) / 10,
      total_miles: Math.round((walk + run + bike) * 10) / 10,
      meal_days,
      hr_sessions,
      is_you: m.id === member.id,
    };
  }).sort((a, b) => b.total_points - a.total_points);

  const teamTotal = stats.reduce((sum, s) => sum + s.total_points, 0);

  if (isLoading) {
    return <p className="text-white/30 text-center py-8">Loading your team...</p>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Team header */}
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-white uppercase tracking-wide">{myTeam?.name}</h2>
          <p className="text-white/40 text-sm">{teammates.length} member{teammates.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-2xl text-primary">{Math.round(teamTotal).toLocaleString()}</div>
          <div className="text-xs text-white/30 uppercase tracking-wider">team total pts</div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 text-left font-bold w-12">#</th>
                <th className="px-4 py-3 text-left font-bold">Member</th>
                <th className="px-4 py-3 text-right font-bold">Points</th>
                <th className="px-4 py-3 text-right font-bold">Miles</th>
                <th className="px-4 py-3 text-right font-bold">Meals</th>
                <th className="px-4 py-3 text-right font-bold">HR Zone</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={s.id} className={`border-t border-white/5 transition-colors ${
                  s.is_you ? "bg-primary/10" : "hover:bg-white/[0.02]"
                }`}>
                  <td className="px-4 py-3 text-white/40 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-semibold">
                        {s.name}
                        {s.is_you && <span className="ml-2 text-xs text-primary font-bold">(YOU)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-primary">{s.total_points.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70">{s.total_miles}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70">{s.meal_days}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70">{s.hr_sessions}</td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/30">No teammates yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {stats.map((s, i) => (
          <div key={s.id} className={`rounded-xl border p-4 ${
            s.is_you ? "bg-primary/10 border-primary/30" : "bg-white/5 border-white/10"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-white/40 font-mono text-sm">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-semibold">
                  {s.name}
                  {s.is_you && <span className="ml-1 text-xs text-primary font-bold">(YOU)</span>}
                </span>
              </div>
              <span className="font-display text-lg font-bold text-primary">{s.total_points}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-white/10">
              <div>
                <div className="text-white/30 uppercase tracking-wider">Miles</div>
                <div className="font-mono font-semibold text-white/80 text-sm">{s.total_miles}</div>
              </div>
              <div>
                <div className="text-white/30 uppercase tracking-wider">Meals</div>
                <div className="font-mono font-semibold text-white/80 text-sm">{s.meal_days}</div>
              </div>
              <div>
                <div className="text-white/30 uppercase tracking-wider">HR Zone</div>
                <div className="font-mono font-semibold text-white/80 text-sm">{s.hr_sessions}</div>
              </div>
            </div>
          </div>
        ))}
        {stats.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No teammates yet.</p>
        )}
      </div>
    </div>
  );
}