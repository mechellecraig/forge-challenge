import { Link, useLocation } from "wouter";
import { LayoutDashboard, Trophy, Users, Activity, User, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/log", label: "Log Activity", icon: Activity },
  { href: "/me", label: "My Stats", icon: User },
  { href: "/admin", label: "Admin", icon: ShieldAlert },
];

export function Layout({ children }) {
  const [location] = useLocation();
  const { member, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.88) 100%), url('/gym-bg.png') center/cover no-repeat fixed" }}>
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Ironworks" className="h-12 w-12 object-contain border-2 border-[#FF5500] rounded-md" />
            <span className="font-display text-white text-2xl tracking-wider uppercase hidden sm:block">
              Ironworks Fitness
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? location === "/" : location.startsWith(href);
                return (
                  <Link key={href} href={href}>
                    <button className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors " + (active ? "bg-primary text-white" : "text-white/50 hover:text-white hover:bg-white/5")}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/20">
        Ironworks Fitness · Forge Challenge · 12-Week Program
      </footer>
    </div>
  );
}
