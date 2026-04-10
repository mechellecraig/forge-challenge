import { Link, useLocation } from "wouter";
import { LayoutDashboard, Trophy, Users, Activity, User, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Program Overview", shortLabel: "Overview", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", shortLabel: "Leaderboard", icon: Trophy },
  { href: "/teams", label: "Teams", shortLabel: "Teams", icon: Users },
  { href: "/log", label: "Log Activity", shortLabel: "Log", icon: Activity },
  { href: "/me", label: "My Stats", shortLabel: "Stats", icon: User },
  { href: "/admin", label: "Admin", shortLabel: "Admin", icon: ShieldAlert },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { member, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.88) 100%), url('/gym-bg.png') center/cover no-repeat fixed" }}>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Ironworks" className="h-12 w-12 object-contain border-2 border-[#FF5500] rounded-md" />
            <span className="font-display text-white text-2xl tracking-wider uppercase hidden sm:block">
              Ironworks Fitness
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? location === "/" : location.startsWith(href);
                return (
                  <Link key={href} href={href}>
                    <button className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors " + (active ? "bg-primary text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">{label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 md:ml-2 md:pl-2 md:border-l md:border-white/10">
              {member && (
                <Link href="/profile">
                  <span className="text-xs text-white/40 hidden md:block hover:text-white cursor-pointer transition-colors">
                    {member.name}
                  </span>
                </Link>
              )}
              <button onClick={signOut} title="Sign out"
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 pb-24 md:pb-8">{children}</main>

      <footer className="hidden md:block border-t border-white/5 py-4 text-center text-xs text-white/20">
        Ironworks Fitness · Forge Challenge · 12-Week Program
      </footer>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-t border-white/10">
        <div className="flex items-center justify-around px-1 py-2">
          {NAV.map(({ href, shortLabel, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <button className={"flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors " + (active ? "text-primary" : "text-white/40 hover:text-white")}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">{shortLabel}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
