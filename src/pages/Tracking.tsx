import { useState } from "react";
import LogActivity from "@/pages/LogActivity";
import MyStats from "@/pages/MyStats";

type Tab = "log" | "stats";

export default function Tracking() {
  const [tab, setTab] = useState<Tab>("log");

  return (
    <div className="space-y-6 pb-2">
      <div className="flex gap-2 flex-wrap">
        {(["log", "stats"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t
                ? "bg-primary text-white"
                : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
            }`}
          >
            {t === "log" ? "Log Activity" : "My Stats"}
          </button>
        ))}
      </div>

      {tab === "log" && <LogActivity />}
      {tab === "stats" && <MyStats />}
    </div>
  );
}