import './_group.css';
import {
  LayoutDashboard, Trophy, Users, Activity, User, ShieldAlert,
  LogOut
} from 'lucide-react';

const NAV = [
  { label: 'Program Overview', icon: LayoutDashboard, active: true },
  { label: 'Leaderboard', icon: Trophy, active: false },
  { label: 'Teams', icon: Users, active: false },
  { label: 'Log Activity', icon: Activity, active: false },
  { label: 'My Stats', icon: User, active: false },
  { label: 'Admin', icon: ShieldAlert, active: false },
];

export function IconRail() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="h-[48px] bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Left Side: Brand Wordmark & Logo */}
          <div className="flex items-center gap-3">
            <h1 className="font-['Oswald'] text-[#FF5500] text-xl font-bold tracking-[0.15em] uppercase leading-none">
              Ironworks Fitness
            </h1>
            <img 
              src="/__mockup/images/logo.png" 
              alt="Logo" 
              className="h-6 w-6 object-contain grayscale brightness-125 opacity-80"
            />
          </div>

          {/* Right Side: Icon-only Navigation */}
          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-1 pr-2 mr-2 border-r border-white/10">
              {NAV.map(({ label, icon: Icon, active }) => (
                <button
                  key={label}
                  title={label}
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-md transition-all
                    ${active 
                      ? 'bg-[#FF5500] text-white' 
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
                  `}
                >
                  <Icon size={18} />
                </button>
              ))}
            </nav>

            {/* Profile & Logout */}
            <div className="flex items-center gap-1">
              <button 
                title="Alex Smith"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/80 text-xs font-bold hover:bg-white/20 transition-colors"
              >
                AS
              </button>
              <button 
                title="Log Out"
                className="w-9 h-9 flex items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

        </div>
      </header>
      
      {/* Mock Content Area */}
      <main className="p-8 max-w-[1200px] mx-auto">
        <div className="h-32 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/20 uppercase tracking-widest text-sm">
          Dashboard Content Area
        </div>
      </main>
    </div>
  );
}
