import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeams, getLogs, getScoringConfig } from "@/lib/api";
import { calcDayPoints, DEFAULT_SCORING } from "@/lib/points";
import { useAuth } from "@/lib/auth";
import { Footprints, Bike, Activity, HeartPulse, Trophy, Calendar, Flame, User } from "lucide-react";

export default function MyStats() {
  const { member } = useAuth();
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });

  const selectedTeam = member ? teams?.find(t => t.id === member.team_id) : null;

  const { data: logs, isLoading } = useQuery({
    queryKey: ["logs", member?.id],
    queryFn: () => getLogs({ memberId: member!.id }),
    enabled: !!member,
  });

  const { data: scoring = DEFAULT_SCORING } = useQuery({ queryKey: ["scoring"], queryFn: getScoringConfig });

  const stats = useMemo(() => {
    if (!logs || !member) return null;
    const age = member.age ?? 0;
    const enriched = logs.map(l => ({
      ...l,
      age,
      points: calcDayPoints({
        walk: l.walk, run: l.run, bike: l.bike,
        meal_plan: l.meal_plan, avg_hr: l.avg_hr,
        day_index: l.day_index, age,
      }, scoring),
    }));

    const totalPoints = Math.round(enriched.reduce((s, l) => s + l.points, 0) * 10) / 10;
    const totalWalk = Math.round(enriched.reduce((s, l) => s + l.walk, 0) * 10) / 10;
    const totalRun = Math.round(enriched.reduce((s, l) => s + l.run, 0) * 10) / 10;
    const totalBike = Math.round(enriched.reduce((s, l) => s + l.bike, 0) * 10) / 10;
    const totalMiles = Math.round((totalWalk + totalRun + totalBike) * 10) / 10;
    const mealPlanDays = enriched.filter(l => l.meal_plan).length;
    const mealPlanPoints = enriched
      .filter(l => l.meal_plan)
      .reduce((s, l) => s + (l.day_index >= 5 ? scoring.meal_weekend : scoring.meal_weekday), 0);
    const hrBonusDays = enriched.filter(l => l.avg_hr > 0 && age > 0 && l.avg_hr >= (220 - age) * scoring.hr_threshold).length;

    const weeks = [...new Set(enriched.map(l => l.week))].sort((a, b) => a - b);
    const byWeek = weeks.map(w => {
      const wl = enriched.filter(l => l.week === w);
      return {
        week: w,
        points: Math.round(wl.reduce((s, l) => s + l.points, 0) * 10) / 10,
        miles: Math.round(wl.reduce((s, l) => s + l.walk + l.run + l.bike, 0) * 10) / 10,
        days: wl.length,
        mealPlan: wl.filter(l => l.meal_plan).length,
      };
    });

    return {
      totalPoints, totalMiles, totalWalk, totalRun, totalBike,
      daysLogged: enriched.length, mealPlanDays, mealPlanPoints, hrBonusDays, byWeek,
      maxWeekPoints: Math.max(...byWeek.map(w => w.points), 1),
    };
  }, [logs, member, scoring]);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-white/30 gap-3">
        <User className="w-12 h-12 opacity-20" />
        <p className="text-lg">Account not linked. Contact your admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-wider mb-2 text-white flex items-center gap-3">
          <User className="w-10 h-10 text-primary" /> My Stats
        </h1>
        <p className="text-white/50 text-lg">Your personal performance breakdown.</p>
      </div>

      {/* Member info */}
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-lg">{member.name}</p>
          <p className="text-white/40 text-sm">{selectedTeam?.name} · Age {member.age} · HR zone: {Math.round((220 - member.age) * 0.75)}+ bpm</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
          {member.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {isLoading && <div className="text-center py-20 text-white/30">Loading your stats...</div>}

      {!isLoading && stats && stats.daysLogged === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-white/30 gap-3">
          <Flame className="w-12 h-12 opacity-20" />
          <p className="text-lg">No activity logged yet. Hit the gym and log your first entry!</p>
        </div>
      )}

      {!isLoading && stats && stats.daysLogged > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Total Points", value: stats.totalPoints, icon: Trophy },
              { title: "Total Miles", value: stats.totalMiles, icon: Flame },
              { title: "Days Logged", value: stats.daysLogged, icon: Calendar },
              { title: "Meal Plan Days", value: stats.mealPlanDays, icon: Activity },
            ].map(({ title, value, icon: Icon }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-white/40 font-bold">{title}</span>
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white mb-3">Activity Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Walk / Run",
                  miles: Math.round((stats.totalWalk + stats.totalRun) * 10) / 10,
                  pts: Math.round((stats.totalWalk + stats.totalRun) * scoring.walk * 10) / 10,
                  icon: Footprints,
                  rate: `${scoring.walk} pts/mi`,
                },
                {
                  label: "Bike",
                  miles: stats.totalBike,
                  pts: Math.round(stats.totalBike * scoring.bike * 10) / 10,
                  icon: Bike,
                  rate: `${scoring.bike} pt${scoring.bike !== 1 ? "s" : ""}/mi`,
                },
              ].map(({ label, miles, pts, icon: Icon, rate }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-white/40 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-white">{miles} <span className="text-sm font-normal text-white/40">mi</span></p>
                    <p className="text-xs text-primary font-bold">{pts} pts <span className="text-white/30 font-normal">({rate})</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <HeartPulse className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/40">HR Zone Days:</span>
              <span className="text-white font-bold">{stats.hrBonusDays}</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">+{stats.hrBonusDays * scoring.hr_zone} pts</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/40">Meal Plan:</span>
              <span className="text-white font-bold">{stats.mealPlanDays} days</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">+{stats.mealPlanPoints} pts</span>
              <span className="text-xs text-white/30">({scoring.meal_weekday} weekday / {scoring.meal_weekend} weekend)</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white mb-3">Week by Week</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                      <th className="text-left px-5 py-3">Week</th>
                      <th className="text-right px-5 py-3">Miles</th>
                      <th className="text-right px-5 py-3">Days</th>
                      <th className="text-right px-5 py-3">Meal Plan</th>
                      <th className="text-right px-5 py-3">Points</th>
                      <th className="px-5 py-3 w-40"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byWeek.map((w, i) => (
                      <tr key={w.week} className={"border-b border-white/5 last:border-0 " + (i % 2 === 0 ? "" : "bg-white/[0.02]")}>
                        <td className="px-5 py-4 font-medium text-white">Week {w.week}</td>
                        <td className="px-5 py-4 text-right text-white/40">{w.miles}</td>
                        <td className="px-5 py-4 text-right text-white/40">{w.days}</td>
                        <td className="px-5 py-4 text-right text-white/40">{w.mealPlan} day{w.mealPlan !== 1 ? "s" : ""}</td>
                        <td className="px-5 py-4 text-right font-bold text-primary">{w.points}</td>
                        <td className="px-5 py-4">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full"
                              style={{ width: (w.points / stats.maxWeekPoints * 100) + "%" }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
