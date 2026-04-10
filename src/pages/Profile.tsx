import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { User, Key, LogOut } from "lucide-react";

export default function Profile() {
  const { user, member, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSetPassword(e) {
    e.preventDefault();
    if (password.length < 6) {
      setMsg({ text: "Password must be at least 6 characters.", ok: false });
      return;
    }
    if (password !== confirm) {
      setMsg({ text: "Passwords do not match.", ok: false });
      return;
    }
    setSaving(true); setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg({ text: "Password set successfully! You can now log in with email and password.", ok: true });
      setPassword(""); setConfirm("");
    } catch (err) {
      setMsg({ text: err.message || "Failed to set password.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-primary";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  return (
    <div className="max-w-md mx-auto pb-12 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <User className="w-8 h-8 text-primary" /> My Profile
        </h1>
      </div>

      {/* Account info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <p className="text-xs uppercase tracking-wider text-white/40 font-bold">Account</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">{member?.name || "Unknown"}</p>
            <p className="text-white/40 text-sm">{user?.email}</p>
          </div>
          <div className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg font-bold">
            Linked
          </div>
        </div>
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
          {msg && (
            <div className={"text-sm font-semibold px-4 py-3 rounded-lg " + (msg.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
              {msg.text}
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
