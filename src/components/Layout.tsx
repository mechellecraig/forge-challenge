import { Link, useLocation } from "wouter";
import { LayoutDashboard, Trophy, Activity, User, ShieldAlert } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/log", label: "Log Activity", icon: Activity },
  { href: "/me", label: "My Stats", icon: User },
  { href: "/admin", label: "Admin", icon: ShieldAlert },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Ironworks" className="h-12 w-12 object-contain" />
            <span className="font-display text-white text-lg tracking-wider uppercase hidden sm:block">
              Ironworks Fitness
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <Link key={href} href={href}>
                  <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    active ? "bg-primary text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/20">
        Ironworks Fitness · Forge Challenge · 12-Week Program
      </footer>
    </div>
  );
}
