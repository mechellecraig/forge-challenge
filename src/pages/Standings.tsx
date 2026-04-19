import { useState } from "react";
import Leaderboard from "@/pages/Leaderboard";
import Teams from "@/pages/Teams";

type Tab = "leaderboard" | "teams";

export default function Standings() {
  const [tab, setTab] = useState<Tab>("leaderboard");

  return (
    <div className="space-y-6 pb-2">
      <div className="flex gap-2 flex-wrap">
        {(["leaderboard", "teams"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t
                ? "bg-primary text-white"
                : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
            }`}
          >
            {t === "leaderboard" ? "Leaderboard" : "Teams & Roster"}
          </button>
        ))}
      </div>

      {tab === "leaderboard" && <Leaderboard />}
      {tab === "teams" && <Teams />}
    </div>
  );
}