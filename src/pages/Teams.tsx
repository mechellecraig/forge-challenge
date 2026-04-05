import { useQuery } from "@tanstack/react-query";
import { getTeams, getMembers, getLeaderboard } from "@/lib/api";
import { Users, Shield } from "lucide-react";

export default function Teams() {
  const { data: teams, isLoading: loadingTeams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: members, isLoading: loadingMembers } = useQuery({ queryKey: ["members"], queryFn: getMembers });
  const { data: leaderboard } = useQuery({ queryKey: ["leaderboard", "all"], queryFn: () => getLeaderboard() });

  const isLoading = loadingTeams || loadingMembers;

  const membersByTeam = (teamId: string) =>
    members?.filter(m => m.team_id === teamId) ?? [];

  const teamPoints = (teamId: string) =>
    leaderboard?.entries.find(e => e.teamId === teamId)?.totalPoints ?? 0;

  const teamRank = (teamId: string) =>
    leaderboard?.entries.find(e => e.teamId === teamId)?.rank ?? null;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" /> Teams & Roster
        </h1>
        <p className="text-white/50 mt-1">All teams and their members.</p>
      </div>

      {isLoading && (
        <div className="text-white/30 text-center py-20">Loading...</div>
      )}

      {!isLoading && (!teams?.length) && (
        <div className="text-center py-20">
          <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-lg">No teams yet. Create them in Admin.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teams?.map(team => {
          const roster = membersByTeam(team.id);
          const pts = teamPoints(team.id);
          const rank = teamRank(team.id);

          return (
            <div key={team.id} className={`rounded-xl border overflow-hidden ${
              rank === 1 ? "border-primary/40 shadow-[0_0_25px_rgba(255,85,0,0.12)]" : "border-white/10"
            }`}>
              {/* Team header */}
              <div className={`px-5 py-4 flex items-center justify-between ${
                rank === 1 ? "bg-primary/10" : "bg-white/5"
              }`}>
                <div className="flex items-center gap-3">
                  {rank && (
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      rank === 1 ? "bg-primary text-white" :
                      rank === 2 ? "bg-white/20 text-white" :
                      rank === 3 ? "bg-orange-900/50 text-orange-200" : "bg-white/5 text-white/40"
                    }`}>{rank}</div>
                  )}
                  <div>
                    <div className="font-display font-bold text-lg text-white uppercase tracking-wide">{team.name}</div>
                    <div className="text-xs text-white/40">{roster.length} member{roster.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-display font-bold text-xl ${rank === 1 ? "text-primary" : "text-white"}`}>
                    {pts.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/30 uppercase tracking-wider">total pts</div>
                </div>
              </div>

              {/* Member list */}
              <div className="divide-y divide-white/5">
                {roster.length === 0 ? (
                  <div className="px-5 py-6 text-center text-white/20 text-sm">No members on this team.</div>
                ) : (
                  roster.map((m, i) => (
                    <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{m.name}</span>
                      </div>
                      <span className="text-xs text-white/30">Age {m.age}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
