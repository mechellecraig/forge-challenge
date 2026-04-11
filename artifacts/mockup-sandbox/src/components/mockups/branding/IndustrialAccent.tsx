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

export function IndustrialAccent() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#fff' }}>
      {/* Top Accent Line */}
      <div style={{ height: '4px', background: '#FF5500', width: '100%' }} />
      
      <header style={{ 
        background: 'rgba(8, 8, 8, 0.95)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
        position: 'sticky', 
        top: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 24px', 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>

          {/* Left Side: Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <img
                src="/__mockup/images/logo.png"
                alt="Ironworks"
                style={{ 
                  height: 42, 
                  width: 42, 
                  objectFit: 'contain', 
                  border: '2px solid #FF5500', 
                  borderRadius: 6,
                  background: '#000'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ 
                fontFamily: 'Oswald, sans-serif', 
                color: '#FF5500', 
                fontSize: 24, 
                letterSpacing: '0.05em', 
                textTransform: 'uppercase', 
                fontWeight: 700 
              }}>
                Ironworks Fitness
              </span>
              <span style={{ 
                fontSize: 9, 
                fontWeight: 800, 
                color: '#FF5500', 
                letterSpacing: '0.2em', 
                marginTop: 2,
                opacity: 0.9
              }}>
                12-WEEK FORGE CHALLENGE
              </span>
            </div>
          </div>

          {/* Right Side: Nav & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {NAV.map(({ label, icon: Icon, active }) => (
                <button
                  key={label}
                  className="group"
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    padding: '8px 12px', 
                    borderRadius: 20,
                    fontSize: 12, 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap', 
                    border: 'none', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: active ? '#FF5500' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'Oswald, sans-serif',
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginLeft: 12, 
              paddingLeft: 16, 
              borderLeft: '1px solid rgba(255,255,255,0.1)', 
              flexShrink: 0 
            }}>
              <button style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '6px 12px', 
                borderRadius: 8, 
                fontSize: 12, 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                border: '1px solid rgba(255,255,255,0.1)', 
                cursor: 'pointer', 
                background: 'rgba(255,255,255,0.05)', 
                color: '#fff', 
                fontFamily: 'Oswald, sans-serif' 
              }}>
                <CircleUser size={18} style={{ color: '#FF5500' }} />
                <span>Alex Smith</span>
              </button>
              <button style={{ 
                padding: 8, 
                borderRadius: 8, 
                border: 'none', 
                cursor: 'pointer', 
                background: 'transparent', 
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <LogOut size={18} />
              </button>
            </div>
          </div>

        </div>
      </header>
      
      {/* Background Texture Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        opacity: 0.03,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3")`,
      }} />
    </div>
  );
}
