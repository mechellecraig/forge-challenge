import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/lib/api";
import { Trophy, Shield, Medal } from "lucide-react";

export default function Leaderboard() {
  const [week, setWeek] = useState(1);
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard", week], queryFn: () => getLeaderboard(week),
  });
  const maxPoints = leaderboard?.entries[0]?.totalPoints || 1;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" /> Leaderboard
          </h1>
          <p className="text-white/50 text-lg mt-2">Rankings and points breakdown by week.</p>
        </div>
        <div className="w-full md:w-48">
          <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1 block">Week</label>
          <select value={week} onChange={e => setWeek(parseInt(e.target.value))}
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Week {i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {!isLoading && (leaderboard?.entries.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard!.entries.slice(0, 3).map(entry => (
            <div key={entry.teamId} className={`p-5 rounded-xl border ${
              entry.rank === 1 ? "border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(255,85,0,0.15)]" :
              entry.rank === 2 ? "border-white/20 bg-white/5" : "border-white/10 bg-white/[0.03]"
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded flex items-center justify-center font-bold text-sm ${
                  entry.rank === 1 ? "bg-primary text-white" :
                  entry.rank === 2 ? "bg-white/20 text-white" : "bg-orange-900/40 text-orange-300"
                }`}>
                  {entry.rank === 1 ? <Medal className="w-4 h-4" /> : entry.rank}
                </div>
                <span className="text-xs text-white/40">{entry.memberCount} members</span>
              </div>
              <div className="font-display font-bold text-xl text-white mb-3">{entry.teamName}</div>
              <div className={`text-3xl font-display font-bold mb-3 ${entry.rank === 1 ? "text-primary" : "text-white"}`}>
                {entry.totalPoints.toLocaleString()}<span className="text-sm font-normal text-white/40 ml-1">pts</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${entry.rank === 1 ? "bg-primary" : "bg-white/30"}`}
                  style={{ width: `${Math.round((entry.totalPoints / maxPoints) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>Activity: {entry.activityPoints}</span>
                {entry.bonusPoints > 0 && <span className="text-green-400">+{entry.bonusPoints} bonus</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="p-4 font-bold w-16">Rank</th>
                <th className="p-4 font-bold">Team</th>
                <th className="p-4 font-bold text-right">Activity</th>
                <th className="p-4 font-bold text-right">Bonus</th>
                <th className="p-4 font-bold text-right text-white">Total</th>
                <th className="p-4 font-bold w-32">vs Leader</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-white/30">Loading...</td></tr>
              ) : !leaderboard?.entries.length ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 text-lg">The forge is cold this week.</p>
                </td></tr>
              ) : leaderboard.entries.map(entry => (
                <tr key={entry.teamId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? "bg-primary text-white shadow-[0_0_10px_rgba(255,85,0,0.4)]" :
                      entry.rank === 2 ? "bg-white/20 text-white" :
                      entry.rank === 3 ? "bg-orange-900/50 text-orange-200" : "bg-white/5 text-white/40"
                    }`}>{entry.rank}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-display font-bold text-lg text-white">{entry.teamName}</div>
                    <div className="text-xs text-white/40 mt-0.5">{entry.memberCount} members</div>
                  </td>
                  <td className="p-4 text-right font-mono text-white/50">{entry.activityPoints.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono">
                    {entry.bonusPoints > 0
                      ? <span className="text-green-400">+{entry.bonusPoints.toLocaleString()}</span>
                      : <span className="text-white/20">—</span>}
                  </td>
                  <td className="p-4 text-right font-display text-2xl font-bold text-primary">
                    {entry.totalPoints.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full ${entry.rank === 1 ? "bg-primary" : "bg-white/25"}`}
                        style={{ width: `${Math.max(4, Math.round((entry.totalPoints / maxPoints) * 100))}%` }} />
                    </div>
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
