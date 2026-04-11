import './_group.css';
import {
  LayoutDashboard, Trophy, Users, Activity, User, ShieldAlert,
  CircleUser, LogOut
} from 'lucide-react';

const NAV = [
  { label: 'Program Overview', icon: LayoutDashboard, active: true },
  { label: 'Leaderboard', icon: Trophy, active: false },
  { label: 'Teams', icon: Users, active: false },
  { label: 'Log Activity', icon: Activity, active: false },
  { label: 'My Stats', icon: User, active: false },
  { label: 'Admin', icon: ShieldAlert, active: false },
];

export function NavHeader() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <header style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <img
              src="/__mockup/images/logo.png"
              alt="Ironworks"
              style={{ height: 40, width: 40, objectFit: 'contain', border: '2px solid #FF5500', borderRadius: 6 }}
            />
            <span style={{ fontFamily: 'Oswald, Arial Narrow, sans-serif', color: '#FF5500', fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              Ironworks Fitness
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {NAV.map(({ label, icon: Icon, active }) => (
                <button
                  key={label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 8px', borderRadius: 8,
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                    background: active ? '#FF5500' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontFamily: 'inherit',
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4, paddingLeft: 4, borderLeft: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit' }}>
                <CircleUser size={14} style={{ flexShrink: 0 }} />
                <span>Alex Smith</span>
              </button>
              <button style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                <LogOut size={14} />
              </button>
            </div>
          </div>

        </div>
      </header>
    </div>
  );
}
