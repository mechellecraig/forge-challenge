import './_group.css';
import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';

const INITIAL_TEAMS = [
  { id: '1', name: 'Team Alpha' },
  { id: '2', name: 'Team Bravo' },
  { id: '3', name: 'Team Charlie' },
];

export function AdminTeamsPreview() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setTeams(prev => [...prev, { id: String(Date.now()), name: newName.trim() }]);
    setNewName('');
  }

  function startEdit(t: { id: string; name: string }) {
    setEditingId(t.id);
    setEditName(t.name);
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return;
    setTeams(prev => prev.map(t => t.id === editingId ? { ...t, name: editName.trim() } : t));
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setTeams(prev => prev.filter(t => t.id !== id));
  }

  const inp = {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: 24, fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 860, margin: '0 auto' }}>

        {/* Create Team */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', margin: '0 0 16px' }}>
            Create Team
          </h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Team name"
              style={{ ...inp, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = '#FF5500')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: '#FF5500', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', cursor: 'pointer' }}>
              Add
            </button>
          </form>
        </div>

        {/* Active Teams */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', margin: '0 0 16px' }}>
            Active Teams{' '}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 13, fontFamily: 'inherit' }}>{teams.length} total</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teams.map(t => (
              <div key={t.id} style={{ borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                {editingId === t.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      style={{ ...inp, flex: 1, padding: '6px 10px', borderColor: 'rgba(255,85,0,0.5)' }}
                    />
                    <button onClick={saveEdit} style={{ padding: 6, borderRadius: 8, background: '#FF5500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="#fff" />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} color="rgba(255,255,255,0.4)" />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{t.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => startEdit(t)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,100,100,0.6)', display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,100,100,0.6)')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 20 }}>
        Click the pencil to rename · Enter to save · Esc to cancel · This preview is interactive
      </p>
    </div>
  );
}
