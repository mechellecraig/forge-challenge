import { Info, Footprints, Bike, UtensilsCrossed, HeartPulse, Star, Trophy, Activity, BarChart3 } from "lucide-react";

const POINTS = [
  { icon: Footprints, label: "Walk / Run", detail: "3 pts per mile", color: "text-blue-400" },
  { icon: Bike, label: "Bike", detail: "1 pt per mile", color: "text-yellow-400" },
  { icon: UtensilsCrossed, label: "Meal Plan (Mon–Fri)", detail: "3 pts per day", color: "text-orange-400" },
  { icon: UtensilsCrossed, label: "Meal Plan (Sat–Sun)", detail: "5 pts per day", color: "text-orange-400" },
  { icon: HeartPulse, label: "HR Zone Session", detail: "+5 pts (≥75% max HR)", color: "text-red-400" },
  { icon: Star, label: "Challenge Bonus", detail: "Monthly sports & weekly challenge pts", color: "text-primary" },
];

const HOW_TO = [
  {
    icon: Activity,
    title: "Log Your Activity",
    desc: "Click Log Activity in the nav. Pick your team, your name, the week, and the day. Enter your miles walked, run, or biked. Check Meal Plan if you stuck to it, and enter your average heart rate if you tracked it.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    desc: "My Stats shows your total points, miles logged, meal plan streak, HR zone days, and a week-by-week breakdown of your performance across the challenge.",
  },
  {
    icon: Trophy,
    title: "Check the Leaderboard",
    desc: "The Leaderboard page shows team standings. Use the Period selector to view a specific week or switch to All Weeks (Total) to see the full 12-week cumulative score.",
  },
];

export default function Overview() {
  return (
    <div className="space-y-10 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <Info className="w-8 h-8 text-primary" /> Program Overview
        </h1>
        <p className="text-white/50 mt-1">Everything you need to know about the Ironworks Intensity Challenge.</p>
      </div>

      {/* About */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="font-display font-bold uppercase tracking-wider text-primary text-lg">About the Challenge</h2>
        <p className="text-white/70 leading-relaxed">
          The <span className="text-white font-semibold">Ironworks Intensity Challenge</span> is a 12-week team fitness competition
          designed to build healthy habits through friendly competition. Members earn points by logging physical activity,
          following a meal plan, and pushing into heart-rate training zones. Teams accumulate points across all weeks, with
          the leading team crowned champion at the end of Week 12.
        </p>
        <p className="text-white/70 leading-relaxed">
          The challenge runs <span className="text-white font-semibold">Monday through Sunday</span> each week.
          Log activity for any day of the current or past weeks. Points are calculated automatically — just enter your miles and habits.
        </p>
        <div className="border-t border-white/10 pt-4 space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Monthly Sports Challenges</h3>
          <p className="text-white/70 leading-relaxed">
            Each month features a rotating sport challenge structured across four weeks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { week: "Week 1", label: "Learn the Sport", desc: "Introduction and skill-building" },
              { week: "Weeks 2–3", label: "Competitive Play", desc: "Put your skills to the test" },
              { week: "Week 4", label: "Tournament", desc: "Bonus points awarded to top performers" },
            ].map(({ week, label, desc }) => (
              <div key={week} className="flex flex-col gap-1 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3">
                <div className="text-xs font-bold text-primary uppercase tracking-wider">{week}</div>
                <div className="text-white text-sm font-semibold">{label}</div>
                <div className="text-white/40 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/70 leading-relaxed">
            A <span className="text-white font-semibold">weekly bonus challenge</span> will also be announced each week —
            complete it to earn extra points for your team.
          </p>
        </div>
      </div>

      {/* Points structure */}
      <div className="space-y-4">
        <h2 className="font-display font-bold uppercase tracking-wider text-white text-lg">Points Structure</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {POINTS.map(({ icon: Icon, label, detail, color }) => (
            <div key={label} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{label}</div>
                <div className="text-white/40 text-xs mt-0.5">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="space-y-4">
        <h2 className="font-display font-bold uppercase tracking-wider text-white text-lg">How to Use This Tracker</h2>
        <div className="space-y-3">
          {HOW_TO.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="flex gap-5 bg-white/5 border border-white/10 rounded-xl px-5 py-5">
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold text-white/20">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <div className="font-display font-bold uppercase tracking-wide text-white text-sm mb-1">{title}</div>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 space-y-3">
        <h2 className="font-display font-bold uppercase tracking-wider text-primary text-lg">Tips for Success</h2>
        <ul className="space-y-2 text-white/60 text-sm leading-relaxed list-none">
          {[
            "Log your activity every day — consistency compounds over 12 weeks.",
            "The meal plan bonus applies per day, not per week. Weekends are worth more, so don't skip Saturday and Sunday.",
            "Track your heart rate during workouts — even one HR zone session a day adds +5 pts.",
            "Check the Leaderboard often to stay motivated and push your team forward.",
            "If you forget to log a day, you can go back and add it — past days are always editable.",
          ].map(tip => (
            <li key={tip} className="flex gap-2">
              <span className="text-primary mt-0.5 flex-shrink-0">›</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
