import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeams, createTeam, deleteTeam, getMembers, createMember, deleteMember, getBonuses, createBonus, verifyPin, changePin, getLogs } from "@/lib/api";
import { calcDayPoints } from "@/lib/points";
import { ShieldAlert, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Tab = "teams" | "members" | "bonuses" | "activity" | "pin";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [tab, setTab] = useState<Tab>("teams");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true); setPinErr("");
    try {
      const valid = await verifyPin(pin);
      if (valid) setAuthenticated(true);
      else setPinErr("Incorrect PIN.");
    } catch { setPinErr("Error verifying PIN."); }
    finally { setChecking(false); }
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white/5 border border-primary/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(255,85,0,0.1)]">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold uppercase tracking-wider text-white text-center mb-1">Admin Access</h1>
          <p className="text-white/40 text-sm text-center mb-6">Restricted area. Enter PIN to continue.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Enter PIN" value={pin} onChange={e => setPin(e.target.value)}
              className="w-full text-center text-2xl tracking-widest h-14 bg-black/40 border border-white/10 text-white rounded-xl focus:outline-none focus:border-primary"
              autoFocus />
            {pinErr && <p className="text-red-400 text-sm text-center font-semibold">{pinErr}</p>}
            <button type="submit" disabled={checking}
              className="w-full h-12 rounded-xl bg-primary text-white font-display font-bold uppercase tracking-wider disabled:opacity-50">
              {checking ? "Verifying..." : "Authenticate"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" /> Control Panel
          </h1>
          <p className="text-white/50 mt-1">Manage teams, members, bonuses and settings.</p>
        </div>
        <button onClick={() => setAuthenticated(false)}
          className="px-4 py-2 rounded-lg border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-colors">
          Lock
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["teams", "members", "activity", "bonuses", "pin"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t ? "bg-primary text-white" : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "teams" && <ManageTeams />}
      {tab === "members" && <ManageMembers />}
      {tab === "activity" && <MemberActivity />}
      {tab === "bonuses" && <ManageBonuses />}
      {tab === "pin" && <ChangePin />}
    </div>
  );
}

function MemberActivity() {
  const { data: members, isLoading: loadingMembers } = useQuery({ queryKey: ["members"], queryFn: getMembers });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: logs, isLoading: loadingLogs } = useQuery({ queryKey: ["logs", "all"], queryFn: () => getLogs() });
  const [expanded, setExpanded] = useState<string | null>(null);

  const isLoading = loadingMembers || loadingLogs;
  const getTeamName = (tid: string) => teams?.find(t => t.id === tid)?.name || "Unknown";

  const memberLogs = (memberId: string) =>
    logs?.filter(l => l.member_id === memberId).sort((a, b) => a.week - b.week || a.day_index - b.day_index) ?? [];

  const memberTotalPoints = (memberId: string) => {
    const member = members?.find(m => m.id === memberId);
    if (!member) return 0;
    return memberLogs(memberId).reduce((sum, log) => sum + calcDayPoints({
      walk: log.walk, run: log.run, bike: log.bike,
      meal_plan: log.meal_plan, avg_hr: log.avg_hr,
      day_index: log.day_index, age: member.age,
    }), 0);
  };

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isLoading) return <p className="text-white/30 text-sm py-8 text-center">Loading activity...</p>;

  return (
    <div className="space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-4">
        {members?.length || 0} members · click a row to expand logs
      </p>
      {!members?.length && (
        <p className="text-white/30 text-sm text-center py-8">No members yet.</p>
      )}
      {members?.map(member => {
        const mLogs = memberLogs(member.id);
        const pts = Math.round(memberTotalPoints(member.id) * 10) / 10;
        const isOpen = expanded === member.id;

        return (
          <div key={member.id} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : member.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{member.name}</div>
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mt-0.5">{getTeamName(member.team_id)}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className="font-mono font-bold text-white">{pts.toLocaleString()} pts</div>
                  <div className="text-xs text-white/30">{mLogs.length} log{mLogs.length !== 1 ? "s" : ""}</div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-white/10">
                {mLogs.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-6">No activity logged yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[550px]">
                      <thead>
                        <tr className="bg-black/30 text-xs uppercase tracking-wider text-white/30">
                          <th className="px-4 py-2 text-left font-bold">Wk</th>
                          <th className="px-4 py-2 text-left font-bold">Day</th>
                          <th className="px-4 py-2 text-right font-bold">Walk</th>
                          <th className="px-4 py-2 text-right font-bold">Run</th>
                          <th className="px-4 py-2 text-right font-bold">Bike</th>
                          <th className="px-4 py-2 text-center font-bold">Meal</th>
                          <th className="px-4 py-2 text-right font-bold">HR</th>
                          <th className="px-4 py-2 text-right font-bold text-white/60">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mLogs.map((log, i) => {
                          const pts = Math.round(calcDayPoints({
                            walk: log.walk, run: log.run, bike: log.bike,
                            meal_plan: log.meal_plan, avg_hr: log.avg_hr,
                            day_index: log.day_index, age: member.age,
                          }) * 10) / 10;
                          return (
                            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                              <td className="px-4 py-2.5 text-white/60">{log.week}</td>
                              <td className="px-4 py-2.5 text-white/60">{DAYS[log.day_index] ?? log.day_index}</td>
                              <td className="px-4 py-2.5 text-right text-white/50">{log.walk > 0 ? `${log.walk}mi` : "—"}</td>
                              <td className="px-4 py-2.5 text-right text-white/50">{log.run > 0 ? `${log.run}mi` : "—"}</td>
                              <td className="px-4 py-2.5 text-right text-white/50">{log.bike > 0 ? `${log.bike}mi` : "—"}</td>
                              <td className="px-4 py-2.5 text-center">
                                {log.meal_plan
                                  ? <span className="text-green-400 font-bold">✓</span>
                                  : <span className="text-white/20">—</span>}
                              </td>
                              <td className="px-4 py-2.5 text-right text-white/50">{log.avg_hr > 0 ? log.avg_hr : "—"}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-primary">{pts}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ManageTeams() {
  const qc = useQueryClient();
  const { data: teams, isLoading } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try { await createTeam(name.trim()); setName(""); qc.invalidateQueries({ queryKey: ["teams"] }); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this team and all its members and logs?")) return;
    await deleteTeam(id);
    qc.invalidateQueries({ queryKey: ["teams"] });
    qc.invalidateQueries({ queryKey: ["members"] });
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-4">Create Team</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Team name"
            className="flex-1 bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold uppercase text-sm disabled:opacity-50">
            Add
          </button>
        </form>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-4">
          Active Teams <span className="text-white/30 font-normal text-sm ml-2">{teams?.length || 0} total</span>
        </h2>
        <div className="space-y-2">
          {isLoading && <p className="text-white/30 text-sm">Loading...</p>}
          {teams?.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="font-semibold text-white">{t.name}</span>
              <button onClick={() => handleDelete(t.id)} className="text-red-400/60 hover:text-red-400 p-1.5 rounded hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {teams?.length === 0 && !isLoading && <p className="text-white/30 text-sm text-center py-4">No teams yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ManageMembers() {
  const qc = useQueryClient();
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: members, isLoading } = useQuery({ queryKey: ["members"], queryFn: getMembers });
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [age, setAge] = useState("30");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    setSaving(true);
    try { await createMember({ name: name.trim(), team_id: teamId, age: parseInt(age) || 30 }); setName(""); qc.invalidateQueries({ queryKey: ["members"] }); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this member?")) return;
    await deleteMember(id);
    qc.invalidateQueries({ queryKey: ["members"] });
  }

  const getTeamName = (tid: string) => teams?.find(t => t.id === tid)?.name || "Unknown";

  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-4">Draft Member</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className={lbl}>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Team</label>
              <select value={teamId} onChange={e => setTeamId(e.target.value)} className={inp}>
                <option value="">Select...</option>
                {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inp} /></div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold uppercase text-sm disabled:opacity-50">
            {saving ? "Adding..." : "Draft to Team"}
          </button>
        </form>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-4">Roster</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading && <p className="text-white/30 text-sm">Loading...</p>}
          {members?.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div>
                <div className="font-semibold text-white">{m.name} <span className="text-white/30 text-xs font-normal">Age {m.age}</span></div>
                <div className="text-xs text-primary font-bold uppercase tracking-wider mt-0.5">{getTeamName(m.team_id)}</div>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-red-400/60 hover:text-red-400 p-1.5 rounded hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {members?.length === 0 && !isLoading && <p className="text-white/30 text-sm text-center py-4">No members yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ManageBonuses() {
  const qc = useQueryClient();
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: bonuses, isLoading } = useQuery({ queryKey: ["bonuses"], queryFn: getBonuses });
  const [teamId, setTeamId] = useState("");
  const [week, setWeek] = useState("1");
  const [points, setPoints] = useState("50");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    setSaving(true);
    try { await createBonus({ team_id: teamId, week: parseInt(week), points: parseInt(points) }); setTeamId(""); qc.invalidateQueries({ queryKey: ["bonuses"] }); qc.invalidateQueries({ queryKey: ["leaderboard"] }); }
    finally { setSaving(false); }
  }

  const getTeamName = (tid: string) => teams?.find(t => t.id === tid)?.name || "Unknown";
  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white/5 border border-primary/20 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-primary mb-1">Award Bonus</h2>
        <p className="text-white/30 text-xs mb-4">Grant extra points for challenges, spirit, or attendance.</p>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className={lbl}>Team</label>
            <select value={teamId} onChange={e => setTeamId(e.target.value)} className={inp}>
              <option value="">Select team...</option>
              {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Week</label><input type="number" min="1" max="12" value={week} onChange={e => setWeek(e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Points</label><input type="number" value={points} onChange={e => setPoints(e.target.value)} className={`${inp} text-primary font-mono`} /></div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold uppercase text-sm disabled:opacity-50">
            {saving ? "Granting..." : "Grant Points"}
          </button>
        </form>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-4">Bonus History</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading && <p className="text-white/30 text-sm">Loading...</p>}
          {bonuses?.map((b, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div>
                <div className="font-semibold text-white">{getTeamName(b.team_id)}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider mt-0.5">Week {b.week}</div>
              </div>
              <div className="font-mono text-lg text-green-400 font-bold">+{b.points}</div>
            </div>
          ))}
          {bonuses?.length === 0 && !isLoading && <p className="text-white/30 text-sm text-center py-4">No bonuses awarded yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ChangePin() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 4) { setMsg({ text: "PIN must be at least 4 characters.", ok: false }); return; }
    if (next !== confirm) { setMsg({ text: "New PINs don't match.", ok: false }); return; }
    setSaving(true);
    try { await changePin(current, next); setMsg({ text: "PIN updated successfully.", ok: true }); setCurrent(""); setNext(""); setConfirm(""); }
    catch (err: any) { setMsg({ text: err.message || "Failed to update PIN.", ok: false }); }
    finally { setSaving(false); }
  }

  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  return (
    <div className="max-w-sm">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-1">Change Admin PIN</h2>
        <p className="text-white/30 text-xs mb-5">Update the PIN used to access admin settings.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={lbl}>Current PIN</label><input type="password" value={current} onChange={e => setCurrent(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>New PIN</label><input type="password" value={next} onChange={e => setNext(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Confirm New PIN</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inp} /></div>
          {msg && <p className={`text-sm font-semibold ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>}
          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold uppercase text-sm disabled:opacity-50">
            {saving ? "Updating..." : "Update PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
