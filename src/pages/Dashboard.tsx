import { useQuery } from "@tanstack/react-query";
import { getSummary, getLeaderboard } from "@/lib/api";
import { Flame, Users, Shield, Activity, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["summary"], queryFn: getSummary, refetchInterval: 60_000,
  });
  const week = summary?.currentWeek || 1;
  const { data: leaderboard, isLoading: loadingLb } = useQuery({
    queryKey: ["leaderboard", week], queryFn: () => getLeaderboard(week),
    enabled: !!summary, refetchInterval: 60_000,
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-wider mb-2 text-white">
          Forge Challenge
        </h1>
        <p className="text-white/50 text-lg">Real-time competition overview · Week {week}</p>
      </div>

      {summary?.topTeam && (
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-5 py-4">
          <Flame className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider text-primary font-bold">Currently Leading</p>
            <p className="text-xl font-display font-bold text-white">{summary.topTeam}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: summary?.totalMembers ?? "—", icon: Users },
          { label: "Active Teams", value: summary?.totalTeams ?? "—", icon: Shield },
          { label: "Logs This Week", value: summary?.totalLogsThisWeek ?? "—", icon: Activity },
          { label: "Total Miles", value: summary ? summary.totalMiles.toLocaleString() : "—", icon: Flame },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-white/40 font-bold">{label}</span>
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-display font-bold text-white">
              {loadingSummary ? "—" : value}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> Standings
          </h2>
          <Link href="/leaderboard" className="text-primary hover:text-primary/80 text-sm font-bold uppercase tracking-wider">
            Full Board →
          </Link>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="p-4 font-bold w-12">Rank</th>
                <th className="p-4 font-bold">Team</th>
                <th className="p-4 font-bold text-right hidden sm:table-cell">Members</th>
                <th className="p-4 font-bold text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {loadingLb ? (
                <tr><td colSpan={4} className="p-8 text-center text-white/30">Loading...</td></tr>
              ) : !leaderboard?.entries.length ? (
                <tr><td colSpan={4} className="p-8 text-center text-white/30">No data yet — get out there and log!</td></tr>
              ) : leaderboard.entries.map(entry => (
                <tr key={entry.teamId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? "bg-primary text-white shadow-[0_0_10px_rgba(255,85,0,0.4)]" :
                      entry.rank === 2 ? "bg-white/20 text-white" :
                      entry.rank === 3 ? "bg-orange-900/50 text-orange-200" : "bg-white/5 text-white/40"
                    }`}>{entry.rank}</div>
                  </td>
                  <td className="p-4 font-display font-bold text-lg text-white">{entry.teamName}</td>
                  <td className="p-4 text-right text-white/40 text-sm hidden sm:table-cell">{entry.memberCount}</td>
                  <td className="p-4 text-right font-display text-xl font-bold text-primary">
                    {entry.totalPoints.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
