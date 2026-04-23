import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ProgramSettings() {
  const [startDate, setStartDate] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const inp =
    "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
  const lbl =
    "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  function calcWeek(dateString: string): number {
    const programStart = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - programStart.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7) + 1;
    return Math.max(1, Math.min(week, 12));
  }

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "program_start_date")
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setStartDate(data.value);
          setOriginalDate(data.value);
          setCurrentWeek(calcWeek(data.value));
        }
      } catch (err: any) {
        setMsg({
          text: err.message || "Failed to load start date.",
          ok: false,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const { error } = await supabase
        .from("app_settings")
        .upsert(
          {
            key: "program_start_date",
            value: startDate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" },
        );
      if (error) throw error;
      setOriginalDate(startDate);
      setCurrentWeek(calcWeek(startDate));
      setMsg({ text: "Program start date updated.", ok: true });
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to save start date.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  const hasChanged = startDate !== originalDate;

  return (
    <div className="max-w-sm">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-1">
          Program Settings
        </h2>
        <p className="text-white/30 text-xs mb-5">
          Set the challenge start date. Current week updates automatically.
        </p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={lbl}>Program Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value) setCurrentWeek(calcWeek(e.target.value));
              }}
              className={inp}
              disabled={loading}
            />
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-white/40 font-bold mb-1">
              Current Week
            </p>
            <p className="text-primary font-display font-bold text-2xl">
              Week {currentWeek} of 12
            </p>
          </div>
          {msg && (
            <p
              className={`text-sm font-semibold ${msg.ok ? "text-green-400" : "text-red-400"}`}
            >
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving || !hasChanged || !startDate}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-bold uppercase text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Start Date"}
          </button>
        </form>
      </div>
    </div>
  );
}
