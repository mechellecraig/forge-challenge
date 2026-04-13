import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeams, getLogs, upsertLog, getScoringConfig } from "@/lib/api";
import { calcDayPoints, DEFAULT_SCORING } from "@/lib/points";
import { useAuth } from "@/lib/auth";
import { Activity, Footprints, Bike, UtensilsCrossed, HeartPulse, Info } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function LogActivity() {
  const qc = useQueryClient();
  const { member } = useAuth();
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });

  const [week, setWeek] = useState(1);
  const [dayIndex, setDayIndex] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const [walkRun, setWalkRun] = useState("");
  const [bike, setBike] = useState("");
  const [mealPlan, setMealPlan] = useState(false);
  const [avgHr, setAvgHr] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const selectedTeam = member ? teams?.find(t => t.id === member.team_id) : null;

  const { data: existingLogs } = useQuery({
    queryKey: ["logs", member?.id, week],
    queryFn: () => getLogs({ memberId: member!.id, week }),
    enabled: !!member,
  });

  const hasDuplicate = existingLogs?.some(l => l.day_index === dayIndex);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function doSubmit() {
    if (!member) return;
    setSaving(true);
    try {
      await upsertLog({
        member_id: member.id,
        week,
        day_index: dayIndex,
        walk: parseFloat(walkRun) || 0,
        run: 0,
        bike: parseFloat(bike) || 0,
        meal_plan: mealPlan,
        avg_hr: parseFloat(avgHr) || 0,
      });
      setWalkRun(""); setBike(""); setMealPlan(false); setAvgHr("");
      qc.invalidateQueries({ queryKey: ["logs"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      showToast("Activity logged successfully!", true);
    } catch {
      showToast("Failed to log activity. Try again.", false);
    } finally {
      setSaving(false);
      setConfirmOverwrite(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    if (hasDuplicate && !confirmOverwrite) { setConfirmOverwrite(true); return; }
    await doSubmit();
  }

  const { data: scoring = DEFAULT_SCORING } = useQuery({ queryKey: ["scoring"], queryFn: getScoringConfig });

  const previewPts = member ? Math.round(calcDayPoints({
    walk: parseFloat(walkRun) || 0,
    run: 0,
    bike: parseFloat(bike) || 0,
    meal_plan: mealPlan,
    avg_hr: parseFloat(avgHr) || 0,
    day_index: dayIndex,
    age: member.age,
  }, scoring) * 10) / 10 : 0;

  const hrTarget = member ? Math.round((220 - member.age) * scoring.hr_threshold) : 0;
  const hrHit = parseFloat(avgHr) > 0 && parseFloat(avgHr) >= hrTarget;

  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  if (!member) {
    return (
      <div className="max-w-2xl mx-auto pb-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <Activity className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/50 text-lg">Account not linked to a member yet.</p>
          <p className="text-white/30 text-sm mt-1">Contact your admin for help.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6">
      {toast && (
        <div className={"fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-bold text-sm shadow-lg " + (toast.ok ? "bg-green-600" : "bg-red-600") + " text-white"}>
          {toast.msg}
        </div>
      )}

      {confirmOverwrite && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/20 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-2">Overwrite Existing Record?</h3>
            <p className="text-white/50 text-sm mb-6">
              A log for <span className="text-white font-semibold">{DAYS[dayIndex]}</span> already exists this week. This will replace it.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmOverwrite(false)} className="flex-1 py-2.5 rounded-lg border border-white/20 text-white/60 text-sm font-bold">Cancel</button>
              <button onClick={doSubmit} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold">
                {saving ? "Saving..." : "Overwrite"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" /> Log Activity
        </h1>
        <p className="text-white/50 mt-2">Submit your daily grind to add points to your team's score.</p>
      </div>

      {/* Member info card */}
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-lg">{member.name}</p>
          <p className="text-white/40 text-sm">{selectedTeam?.name} · Age {member.age} · HR zone target: {hrTarget}+ bpm</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
          {member.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-3">
          <Info className="w-3.5 h-3.5" /> How Points Are Scored
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {([
            [Footprints, "Walk / Run", `${scoring.walk} pts per mile`, "text-blue-400"],
            [Bike, "Bike", `${scoring.bike} pt${scoring.bike !== 1 ? "s" : ""} per mile`, "text-yellow-400"],
            [UtensilsCrossed, "Meal Plan (Mon–Fri)", `${scoring.meal_weekday} pts per day`, "text-orange-400"],
            [UtensilsCrossed, "Meal Plan (Sat–Sun)", `${scoring.meal_weekend} pts per day`, "text-orange-400"],
            [HeartPulse, "HR Zone Session", `+${scoring.hr_zone} pts (≥${Math.round(scoring.hr_threshold * 100)}% max HR, >30 min)`, "text-red-400"],
          ] as [any, string, string, string][]).map(([Icon, label, hint, color]) => (
            <div key={label} className="flex items-center gap-2 whitespace-nowrap">
              <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
              <span><span className="text-white font-semibold">{label}</span> — <span className="text-white/50">{hint}</span></span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
          <div>
            <label className={lbl}>Week</label>
            <select value={week} onChange={e => setWeek(parseInt(e.target.value))} className={inp}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Week {i + 1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Day</label>
            <select value={dayIndex} onChange={e => setDayIndex(parseInt(e.target.value))} className={inp}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-2 mb-4">Activity Miles</h3>
          <div className="grid grid-cols-2 gap-4">
            {([
              ["Walk / Run", `${scoring.walk} pts/mi`, walkRun, setWalkRun],
              ["Bike", `${scoring.bike} pt${scoring.bike !== 1 ? "s" : ""}/mi`, bike, setBike],
            ] as [string, string, string, (v: string) => void][]).map(([name, hint, val, setter]) => (
              <div key={name}>
                <label className={lbl}>{name} <span className="text-white/20 normal-case font-normal">{hint}</span></label>
                <input type="number" min="0" step="0.1" value={val}
                  onChange={e => setter(e.target.value)}
                  className={inp + " font-mono text-lg text-center"} placeholder="0" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-6">
          <div>
            <label className={lbl}>Avg Heart Rate (bpm) <span className="text-white/20 normal-case">zone: {hrTarget}+ bpm</span></label>
            <input type="number" min="0" value={avgHr} onChange={e => setAvgHr(e.target.value)}
              className={inp} placeholder="e.g. 135" />
            {parseFloat(avgHr) > 0 && (
              <p className={"text-xs mt-1.5 font-semibold " + (hrHit ? "text-green-400" : "text-orange-400")}>
                {hrHit ? "HR zone hit — +5 pts" : (hrTarget - parseFloat(avgHr)) + " bpm below target"}
              </p>
            )}
          </div>
          <div>
            <label className={lbl}>Meal Plan</label>
            <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] cursor-pointer">
              <input type="checkbox" checked={mealPlan} onChange={e => setMealPlan(e.target.checked)}
                className="mt-0.5 accent-primary w-4 h-4" />
              <div>
                <span className="text-white text-sm font-semibold block">Followed meal plan today</span>
                <span className="text-white/40 text-xs">{dayIndex >= 5 ? "+5 pts (weekend)" : "+3 pts (weekday)"}</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-5 py-3">
          <span className="text-white/60 text-sm">Points this entry</span>
          <span className="text-primary font-display text-2xl font-bold">{previewPts}</span>
        </div>

        <button type="submit" disabled={saving}
          className="w-full h-12 rounded-xl bg-primary text-white font-display font-bold text-lg uppercase tracking-wider disabled:opacity-40 hover:bg-primary/90 transition-colors">
          {saving ? "Forging..." : "Strike the Anvil — Log Activity"}
        </button>
      </form>
    </div>
  );
}
