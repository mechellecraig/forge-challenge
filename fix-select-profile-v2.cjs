const fs = require('fs');

fs.writeFileSync('src/pages/SelectProfile.tsx', `import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeams, getMembers } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { User } from "lucide-react";

export default function SelectProfile() {
  const { user } = useAuth();
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: members } = useQuery({ queryKey: ["members"], queryFn: getMembers });

  const [teamId, setTeamId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [linked, setLinked] = useState(false);

  const unlinkedMembers = members?.filter(m => !m.user_id) || [];
  const teamMembers = unlinkedMembers.filter(m => m.team_id === teamId);

  async function handleLink() {
    if (!memberId || !user) return;
    setSaving(true); setError("");
    try {
      const { error } = await supabase
        .from("members")
        .update({ user_id: user.id })
        .eq("id", memberId);
      if (error) throw error;
      setLinked(true);
      // Sign out and back in to force a fresh session with the new member link
      await supabase.auth.signOut();
    } catch (err: any) {
      setError("Failed to link your account. Please try again or contact your admin.");
      setSaving(false);
    }
  }

  if (linked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <img src="/logo.png" alt="Ironworks" className="h-20 w-20 object-contain border-2 border-[#FF5500] rounded-xl mx-auto" />
          <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white">Account Linked!</h2>
          <p className="text-white/50 text-sm">Please sign in again to continue.</p>
          <a href="/login"
            className="block w-full h-12 rounded-xl bg-primary text-white font-display font-bold text-base uppercase tracking-wider leading-[3rem] hover:bg-primary/90 transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const sel = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Ironworks" className="h-20 w-20 object-contain border-2 border-[#FF5500] rounded-xl" />
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Welcome!</h1>
            <p className="text-white/40 text-sm mt-1">Select your name to get started</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
            <User className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-white/60">This links your account to your participant profile. You only need to do this once.</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5">Your Team</label>
            <select value={teamId} onChange={e => { setTeamId(e.target.value); setMemberId(""); }} className={sel}>
              <option value="">Select your team...</option>
              {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5">Your Name</label>
            <select value={memberId} onChange={e => setMemberId(e.target.value)} className={sel} disabled={!teamId}>
              <option value="">{teamId ? "Select your name..." : "Select team first"}</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

          <button onClick={handleLink} disabled={!memberId || saving}
            className="w-full h-12 rounded-xl bg-primary text-white font-display font-bold text-base uppercase tracking-wider disabled:opacity-40 hover:bg-primary/90 transition-colors">
            {saving ? "Linking account..." : "This is me — Get Started"}
          </button>
        </div>

        <p className="text-center text-xs text-white/20">
          Don't see your name? Contact your admin to be added to the roster.
        </p>
      </div>
    </div>
  );
}
`);

console.log('SelectProfile.tsx updated - now signs out after linking so fresh login picks up member');
