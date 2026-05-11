import { useQuery } from "@tanstack/react-query";
import { getLogs, getScoringConfig } from "@/lib/api";
import { calcDayPoints, DEFAULT_SCORING } from "@/lib/points";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { weekDayToDate, formatLogDate } from "@/lib/dateHelpers";
import {
  History,
  Footprints,
  Bike,
  UtensilsCrossed,
  HeartPulse,
} from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

async function getProgramStartDate(): Promise<string | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "program_start_date")
    .maybeSingle();
  if (error || !data) return null;
  return data.value as string;
}

export default function ActivityHistory() {
  const { member } = useAuth();

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["logs", member?.id],
    queryFn: () => getLogs({ memberId: member!.id }),
    enabled: !!member,
  });

  const { data: scoring = DEFAULT_SCORING } = useQuery({
    queryKey: ["scoring"],
    queryFn: getScoringConfig,
  });

  const { data: programStartDate } = useQuery({
    queryKey: ["program_start_date"],
    queryFn: getProgramStartDate,
  });

  if (!member) return null;

  // Sort: most recent first (week DESC, day_index DESC)
  const sorted = (logs ?? [])
    .slice()
    .sort((a, b) =>
      b.week !== a.week ? b.week - a.week : b.day_index - a.day_index,
    );

  const hrTarget = Math.round((220 - member.age) * scoring.hr_threshold);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <History className="w-5 h-5 text-primary" /> Activity History
        </h2>
        {sorted.length > 0 && (
          <span className="text-xs text-white/40 font-semibold">
            {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {logsLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <History className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No activity logged yet.</p>
          <p className="text-white/30 text-xs mt-1">
            Use the form above to log your first day.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((log) => {
            const pts =
              Math.round(
                calcDayPoints(
                  {
                    walk: log.walk,
                    run: log.run,
                    bike: log.bike,
                    meal_plan: log.meal_plan,
                    avg_hr: log.avg_hr,
                    day_index: log.day_index,
                    age: member.age,
                  },
                  scoring,
                ) * 10,
              ) / 10;

            const dateStr = programStartDate
              ? formatLogDate(
                  weekDayToDate(programStartDate, log.week, log.day_index),
                )
              : null;

            const totalMiles = log.walk + log.run + log.bike;
            const hrHit = log.avg_hr > 0 && log.avg_hr >= hrTarget;

            return (
              <li
                key={`${log.week}-${log.day_index}`}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-white font-bold text-sm">
                      Week {log.week}, {DAY_LABELS[log.day_index]}
                    </span>
                    {dateStr && (
                      <span className="text-white/40 text-xs">· {dateStr}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
                    {totalMiles > 0 && (
                      <span className="flex items-center gap-1">
                        <Footprints className="w-3 h-3 text-blue-400" />
                        {log.walk + log.run > 0 && (
                          <span>{(log.walk + log.run).toFixed(1)} mi</span>
                        )}
                      </span>
                    )}
                    {log.bike > 0 && (
                      <span className="flex items-center gap-1">
                        <Bike className="w-3 h-3 text-yellow-400" />
                        <span>{log.bike.toFixed(1)} mi</span>
                      </span>
                    )}
                    {log.meal_plan && (
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed className="w-3 h-3 text-orange-400" />
                        <span>meal plan</span>
                      </span>
                    )}
                    {log.avg_hr > 0 && (
                      <span className="flex items-center gap-1">
                        <HeartPulse
                          className={`w-3 h-3 ${hrHit ? "text-red-400" : "text-white/30"}`}
                        />
                        <span className={hrHit ? "text-red-300" : ""}>
                          {log.avg_hr} bpm
                          {hrHit && " ✓"}
                        </span>
                      </span>
                    )}
                    {totalMiles === 0 &&
                      !log.meal_plan &&
                      log.avg_hr === 0 && (
                        <span className="text-white/30 italic">
                          empty entry
                        </span>
                      )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-primary font-display font-bold text-lg leading-none">
                    {pts}
                  </div>
                  <div className="text-white/30 text-[10px] uppercase tracking-wider font-bold mt-0.5">
                    pts
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
