import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useCurrentWeek() {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchWeek = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "program_start_date")
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setStartDate(data.value);

      const programStart = new Date(data.value);
      const now = new Date();
      const diffMs = now.getTime() - programStart.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const week = Math.floor(diffDays / 7) + 1;

      setCurrentWeek(Math.max(1, Math.min(week, 12)));
    } catch (err) {
      console.error("useCurrentWeek error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeek();
    // Refresh every 5 minutes so admin date changes propagate
    const interval = setInterval(fetchWeek, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { currentWeek, startDate, loading, refresh: fetchWeek };
}
