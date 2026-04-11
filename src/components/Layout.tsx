import { Link, useLocation } from "wouter";
import { LayoutDashboard, Trophy, Users, Activity, User, ShieldAlert, LogOut, CircleUser } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Program Overview", icon: LayoutDashboard, adminOnly: false },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, adminOnly: false },
  { href: "/teams", label: "Teams", icon: Users, adminOnly: false },
  { href: "/log", label: "Log Activity", icon: Activity, adminOnly: false },
  { href: "/me", label: "My Stats", icon: User, adminOnly: false },
  { href: "/admin", label: "Admin", icon: ShieldAlert, adminOnly: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { member, signOut } = useAuth();

  const visibleNav = NAV.filter(item => !item.adminOnly || member?.is_admin);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.88) 100%), url('/gym-bg.png') center/cover no-repeat fixed" }}>
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/">
              <img src="/logo.png" alt="Ironworks" className="h-10 w-10 object-contain border-2 border-[#FF5500] rounded-md" />
            </Link>
            <a href="https://www.ironworksfitnessnc.com" target="_blank" rel="noopener noreferrer"
              className="font-display text-primary text-xl tracking-wider uppercase hidden sm:block">
              Ironworks Fitness
            </a>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            <nav className="flex items-center gap-0.5">
              {visibleNav.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? location === "/" : location.startsWith(href);
                return (
                  <Link key={href} href={href}>
                    <button className={"flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap " + (active ? "bg-primary text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden lg:inline">{label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/10 shrink-0">
              {member && (
                <Link href="/profile">
                  <button className={"flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors " + (location.startsWith("/profile") ? "bg-primary text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>
                    <CircleUser className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden md:inline">{member.name}</span>
                  </button>
                </Link>
              )}
              <button onClick={signOut} title="Sign out"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/20">
        Ironworks Fitness · Forge Challenge · 12-Week Program
      </footer>
    </div>
  );
}
