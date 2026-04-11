import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { User, Key, LogOut, Mail, Calendar } from "lucide-react";

export default function Profile() {
  const { user, member, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [age, setAge] = useState(member?.age?.toString() || "");
  const [savingAge, setSavingAge] = useState(false);
  const [ageMsg, setAgeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setPwMsg({ text: "Password must be at least 6 characters.", ok: false });
      return;
    }
    if (password !== confirm) {
      setPwMsg({ text: "Passwords do not match.", ok: false });
      return;
    }
    setSaving(true); setPwMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPwMsg({ text: "Password set! You can now log in with email and password.", ok: true });
      setPassword(""); setConfirm("");
    } catch (err: any) {
      setPwMsg({ text: err.message || "Failed to set password.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateAge(e: React.FormEvent) {
    e.preventDefault();
    const newAge = parseInt(age);
    if (!newAge || newAge < 10 || newAge > 100) {
      setAgeMsg({ text: "Please enter a valid age between 10 and 100.", ok: false });
      return;
    }
    if (!member) return;
    setSavingAge(true); setAgeMsg(null);
    try {
      const { error } = await supabase
        .from("members")
        .update({ age: newAge })
        .eq("id", member.id);
      if (error) throw error;
      setAgeMsg({ text: "Age updated! Your HR zone target has been recalculated.", ok: true });
      // Reload to refresh auth context with new age
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setAgeMsg({ text: err.message || "Failed to update age.", ok: false });
    } finally {
      setSavingAge(false);
    }
  }

  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-primary";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";
  const hrTarget = member ? Math.round((220 - member.age) * 0.75) : 0;

  return (
    <div className="max-w-md mx-auto pb-12 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <User className="w-8 h-8 text-primary" /> My Profile
        </h1>
      </div>

      {/* Account info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <p className="text-xs uppercase tracking-wider text-white/40 font-bold">Account Info</p>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {member?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{member?.name || "Unknown"}</p>
            <p className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold inline-block mt-1">Linked</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-white/30 shrink-0" />
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Email</p>
              <p className="text-white text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-white/30 shrink-0" />
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Age & HR Zone</p>
              <p className="text-white text-sm">Age {member?.age} · HR zone target: {hrTarget}+ bpm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Update age */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-white uppercase tracking-wider">Update Age</p>
        </div>
        <p className="text-xs text-white/40">
          Your age is used to calculate your heart rate zone target (75% of 220 minus age). Average that zone for &gt;30 min to earn +5 pts. Keep your age accurate for correct points.
        </p>
        <form onSubmit={handleUpdateAge} className="flex gap-3">
          <input type="number" min="10" max="100" value={age} onChange={e => setAge(e.target.value)}
            className={inp} placeholder="Your age" />
          <button type="submit" disabled={savingAge}
            className="px-6 py-3 rounded-lg bg-white/10 text-white font-bold uppercase text-sm disabled:opacity-40 hover:bg-white/20 transition-colors whitespace-nowrap">
            {savingAge ? "Saving..." : "Update"}
          </button>
        </form>
        {ageMsg && (
          <p className={"text-sm font-semibold " + (ageMsg.ok ? "text-green-400" : "text-red-400")}>{ageMsg.text}</p>
        )}
      </div>

      {/* Set password */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-white uppercase tracking-wider">Set a Password</p>
        </div>
        <p className="text-xs text-white/40">
          Set a password so you can log in with email and password instead of requesting a magic link every time.
        </p>
        <form onSubmit={handleSetPassword} className="space-y-3">
          <div>
            <label className={lbl}>New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className={inp} placeholder="At least 6 characters" required />
          </div>
          <div>
            <label className={lbl}>Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className={inp} placeholder="Re-enter password" required />
          </div>
          {pwMsg && (
            <div className={"text-sm font-semibold px-4 py-3 rounded-lg " + (pwMsg.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
              {pwMsg.text}
            </div>
          )}
          <button type="submit" disabled={saving}
            className="w-full h-11 rounded-xl bg-primary text-white font-bold uppercase text-sm tracking-wider disabled:opacity-40 hover:bg-primary/90 transition-colors">
            {saving ? "Saving..." : "Set Password"}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <button onClick={signOut}
        className="w-full h-11 rounded-xl border border-white/10 text-white/50 font-bold uppercase text-sm tracking-wider hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
