import './_group.css';
import {
  LayoutDashboard, Trophy, Users, Activity, User, ShieldAlert,
  CircleUser, LogOut
} from 'lucide-react';

const NAV_LEFT = [
  { label: 'Program Overview', icon: LayoutDashboard, active: true },
  { label: 'Leaderboard', icon: Trophy, active: false },
  { label: 'Teams', icon: Users, active: false },
];

const NAV_RIGHT = [
  { label: 'Log Activity', icon: Activity, active: false },
  { label: 'My Stats', icon: User, active: false },
  { label: 'Admin', icon: ShieldAlert, active: false },
];

export function SplitCenter() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-50 h-16 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Left Nav Group */}
          <nav className="flex items-center gap-1 flex-1 justify-start">
            {NAV_LEFT.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  active ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden lg:block">
                  {label}
                </span>
              </button>
            ))}
          </nav>

          {/* Center Brand Mark */}
          <div className="flex items-center gap-4 flex-shrink-0 px-8">
            <img
              src="/__mockup/images/logo.png"
              alt="Ironworks"
              className="h-10 w-10 object-contain border-2 border-[#FF5500] rounded-md"
            />
            <span className="font-['Oswald'] text-[#FF5500] text-2xl tracking-[0.15em] uppercase font-bold whitespace-nowrap">
              Ironworks Fitness
            </span>
          </div>

          {/* Right Nav Group + Profile */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            <nav className="flex items-center gap-1 mr-4 border-r border-white/10 pr-4">
              {NAV_RIGHT.map(({ label, icon: Icon, active }) => (
                <button
                  key={label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    active ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden lg:block">
                    {label}
                  </span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-md text-white/40 hover:text-white/70 transition-colors">
                <CircleUser size={18} />
                <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">
                  Alex Smith
                </span>
              </button>
              <button className="p-2 text-white/20 hover:text-[#FF5500] transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>

        </div>
      </header>
      
      {/* Mock Content to show scroll behavior */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="h-[200vh] border-2 border-dashed border-white/5 rounded-2xl flex items-start justify-center pt-20">
          <p className="text-white/20 font-['Oswald'] uppercase tracking-widest text-4xl">Content Area</p>
        </div>
      </main>
    </div>
  );
}
