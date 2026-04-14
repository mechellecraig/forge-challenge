import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeams, createTeam, updateTeam, deleteTeam, getMembers, createMember, deleteMember, getBonuses, createBonus, updateBonus, deleteBonus, verifyPin, changePin, getLogs, getScoringConfig, setScoringConfig, ScoringConfig } from "@/lib/api";
import { calcDayPoints, DEFAULT_SCORING } from "@/lib/points";
import { ShieldAlert, Trash2, ChevronDown, ChevronUp, Pencil, X, Check } from "lucide-react";
import Dashboard from "@/pages/Dashboard";

type Tab = "dashboard" | "teams" | "members" | "bonuses" | "activity" | "scoring" | "pin";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

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
        {(["dashboard", "teams", "members", "activity", "bonuses", "scoring", "pin"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t ? "bg-primary text-white" : "border border-white/10 text-white/40 hover:text-white hover:border-white/20"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <Dashboard />}
      {tab === "teams" && <ManageTeams />}
      {tab === "members" && <ManageMembers />}
      {tab === "activity" && <MemberActivity />}
      {tab === "bonuses" && <ManageBonuses />}
      {tab === "scoring" && <ScoringSettings />}
      {tab === "pin" && <ChangePin />}
    </div>
  );
}

function MemberActivity() {
  const { data: members, isLoading: loadingMembers } = useQuery({ queryKey: ["members"], queryFn: getMembers });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: logs, isLoading: loadingLogs } = useQuery({ queryKey: ["logs", "all"], queryFn: () => getLogs() });
  const { data: scoring = DEFAULT_SCORING } = useQuery({ queryKey: ["scoring"], queryFn: getScoringConfig });
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
    }, scoring), 0);
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
                          }, scoring) * 10) / 10;
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try { await createTeam(name.trim()); setName(""); qc.invalidateQueries({ queryKey: ["teams"] }); }
    finally { setSaving(false); }
  }

  function startEdit(t: { id: string; name: string }) {
    setEditingId(t.id);
    setEditName(t.name);
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    setEditSaving(true);
    try {
      await updateTeam(editingId, editName.trim());
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    } finally { setEditSaving(false); }
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
            <div key={t.id} className="rounded-lg bg-white/[0.03] border border-white/5 overflow-hidden">
              {editingId === t.id ? (
                <div className="flex items-center gap-2 p-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 bg-black/40 border border-primary/50 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                  />
                  <button onClick={handleSaveEdit} disabled={editSaving}
                    className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3">
                  <span className="font-semibold text-white">{t.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(t)} className="text-white/30 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-400/60 hover:text-red-400 p-1.5 rounded hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
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

  // Add form state
  const [teamId, setTeamId] = useState("");
  const [week, setWeek] = useState("1");
  const [points, setPoints] = useState("50");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTeamId, setEditTeamId] = useState("");
  const [editWeek, setEditWeek] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["bonuses"] });
    qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    setSaving(true);
    try {
      await createBonus({ team_id: teamId, week: parseInt(week), points: parseInt(points), description });
      setTeamId(""); setDescription("");
      invalidate();
    } finally { setSaving(false); }
  }

  function startEdit(b: { id: string; team_id: string; week: number; points: number; description: string }) {
    setEditingId(b.id);
    setEditTeamId(b.team_id);
    setEditWeek(String(b.week));
    setEditPoints(String(b.points));
    setEditDescription(b.description ?? "");
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setEditSaving(true);
    try {
      await updateBonus(editingId, {
        team_id: editTeamId,
        week: parseInt(editWeek),
        points: parseInt(editPoints),
        description: editDescription,
      });
      setEditingId(null);
      invalidate();
    } finally { setEditSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bonus?")) return;
    await deleteBonus(id);
    invalidate();
  }

  const getTeamName = (tid: string) => teams?.find(t => t.id === tid)?.name || "Unknown";
  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
  const inpSm = "bg-black/40 border border-white/10 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-primary";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Add bonus form */}
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
          <div>
            <label className={lbl}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Week 4 tournament winner" className={inp} />
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

      {/* Bonus history with edit/delete */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-4">
          Bonus History <span className="text-white/30 font-normal text-sm ml-1">{bonuses?.length || 0} total</span>
        </h2>
        <div className="space-y-2 max-h-[480px] overflow-y-auto">
          {isLoading && <p className="text-white/30 text-sm">Loading...</p>}

          {bonuses?.map(b => (
            <div key={b.id} className="rounded-lg bg-white/[0.03] border border-white/5 overflow-hidden">
              {editingId === b.id ? (
                /* ── Inline edit form ── */
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Team</p>
                      <select value={editTeamId} onChange={e => setEditTeamId(e.target.value)} className={`${inpSm} w-full`}>
                        {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Week</p>
                      <input type="number" min="1" max="12" value={editWeek} onChange={e => setEditWeek(e.target.value)} className={`${inpSm} w-full`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Description</p>
                    <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} className={`${inpSm} w-full`} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Points</p>
                    <input type="number" value={editPoints} onChange={e => setEditPoints(e.target.value)} className={`${inpSm} w-full text-primary font-mono font-bold`} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveEdit} disabled={editSaving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold uppercase disabled:opacity-50">
                      <Check className="w-3.5 h-3.5" />{editSaving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs font-bold uppercase hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Read-only row ── */
                <div className="flex items-center justify-between px-3 py-3 gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{getTeamName(b.team_id)}</div>
                    {b.description && <div className="text-xs text-white/60 mt-0.5 truncate">{b.description}</div>}
                    <div className="text-xs text-white/30 uppercase tracking-wider mt-0.5">Week {b.week}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-lg text-green-400 font-bold">+{b.points}</span>
                    <button onClick={() => startEdit(b)}
                      className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded hover:bg-red-400/10 text-red-400/50 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {bonuses?.length === 0 && !isLoading && (
            <p className="text-white/30 text-sm text-center py-4">No bonuses awarded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoringSettings() {
  const qc = useQueryClient();
  const { data: current = DEFAULT_SCORING } = useQuery({ queryKey: ["scoring"], queryFn: getScoringConfig });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const val = (key: string, fallback: number) =>
    fields[key] !== undefined ? fields[key] : String(fallback);
  const set = (key: string, v: string) => setFields(f => ({ ...f, [key]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const walkRun = parseFloat(val("walk_run", current.walk));
    const bike = parseFloat(val("bike", current.bike));
    const mealWd = parseFloat(val("meal_weekday", current.meal_weekday));
    const mealWe = parseFloat(val("meal_weekend", current.meal_weekend));
    const hrZone = parseFloat(val("hr_zone", current.hr_zone));
    const hrPct = parseFloat(val("hr_threshold_pct", current.hr_threshold * 100));

    if ([walkRun, bike, mealWd, mealWe, hrZone].some(v => isNaN(v) || v < 0)) {
      setMsg({ text: "All point values must be 0 or greater.", ok: false }); return;
    }
    if (isNaN(hrPct) || hrPct < 50 || hrPct > 100) {
      setMsg({ text: "HR threshold must be between 50 and 100.", ok: false }); return;
    }
    setSaving(true);
    try {
      await setScoringConfig({ walk_run: walkRun, bike, meal_weekday: mealWd, meal_weekend: mealWe, hr_zone: hrZone, hr_threshold: hrPct / 100 });
      const newScoring: ScoringConfig = { walk: walkRun, run: walkRun, bike, meal_weekday: mealWd, meal_weekend: mealWe, hr_zone: hrZone, hr_threshold: hrPct / 100 };
      qc.setQueryData(["scoring"], newScoring);
      await qc.invalidateQueries({ queryKey: ["scoring"] });
      await qc.invalidateQueries({ queryKey: ["leaderboard"] });
      await qc.invalidateQueries({ queryKey: ["summary"] });
      setMsg({ text: "Scoring updated successfully.", ok: true });
      setFields({});
    } catch (err: any) {
      console.error("Scoring save error:", err);
      setMsg({ text: err.message || "Failed to save scoring.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-mono text-center";
  const lbl = "block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5";

  return (
    <div className="max-w-lg">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-white mb-1">Scoring Settings</h2>
        <p className="text-white/30 text-xs mb-6">Adjust point values for all activity types. Changes apply to all future calculations and leaderboard totals.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 border-b border-white/10 pb-2">Activity Miles</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Walk / Run (pts/mi)</label>
                <input type="number" min="0" step="0.5" value={val("walk_run", current.walk)}
                  onChange={e => set("walk_run", e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Bike (pts/mi)</label>
                <input type="number" min="0" step="0.5" value={val("bike", current.bike)}
                  onChange={e => set("bike", e.target.value)} className={inp} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 border-b border-white/10 pb-2">Meal Plan</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Weekday (Mon–Fri) pts</label>
                <input type="number" min="0" step="1" value={val("meal_weekday", current.meal_weekday)}
                  onChange={e => set("meal_weekday", e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Weekend (Sat–Sun) pts</label>
                <input type="number" min="0" step="1" value={val("meal_weekend", current.meal_weekend)}
                  onChange={e => set("meal_weekend", e.target.value)} className={inp} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 border-b border-white/10 pb-2">HR Zone Bonus</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Min. Heart Rate (% of max)</label>
                <input type="number" min="50" max="100" step="1" value={val("hr_threshold_pct", current.hr_threshold * 100)}
                  onChange={e => set("hr_threshold_pct", e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Bonus Points Awarded</label>
                <input type="number" min="0" step="1" value={val("hr_zone", current.hr_zone)}
                  onChange={e => set("hr_zone", e.target.value)} className={inp} />
              </div>
            </div>
            <p className="text-white/30 text-xs mt-2">Members earn the bonus points when their logged avg HR is at or above this % of their max HR (220 − age).</p>
          </div>
          {msg && <p className={`text-sm font-semibold ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>}
          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold uppercase text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Save Scoring Changes"}
          </button>
        </form>
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
