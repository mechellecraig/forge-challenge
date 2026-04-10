const fs = require("fs");

// auth.tsx
fs.writeFileSync(
  "src/lib/auth.tsx",
  `import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({
  user: null as any,
  session: null as any,
  member: null as any,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMember(userId: string) {
    const { data } = await supabase.from("members").select("*").eq("user_id", userId).single();
    setMember(data || null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchMember(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchMember(session.user.id);
      else setMember(null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setMember(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, member, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
`,
);
console.log("auth.tsx created");

// Login.tsx
fs.writeFileSync(
  "src/pages/Login.tsx",
  `import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "password" | "magic";

export default function Login() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMsg({ text: "Magic link sent! Check your email and click the link to sign in.", ok: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setMsg({ text: err.message || "Something went wrong. Try again.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  const inp = "w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-primary placeholder:text-white/20";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Ironworks" className="h-20 w-20 object-contain border-2 border-[#FF5500] rounded-xl" />
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Ironworks Fitness</h1>
            <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Forge Challenge</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl">
            {(["password", "magic"] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setMsg(null); }}
                className={"flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors " + (mode === m ? "bg-primary text-white" : "text-white/40 hover:text-white")}>
                {m === "password" ? "Password" : "Magic Link"}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className={inp} placeholder="you@example.com" required autoFocus />
            </div>
            {mode === "password" && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/40 font-bold mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className={inp} placeholder="••••••••" required />
              </div>
            )}
            {msg && (
              <div className={"text-sm font-semibold px-4 py-3 rounded-lg " + (msg.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
                {msg.text}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-display font-bold text-base uppercase tracking-wider disabled:opacity-40 hover:bg-primary/90 transition-colors">
              {loading ? "..." : mode === "password" ? "Sign In" : "Send Magic Link"}
            </button>
          </form>
          {mode === "password" && (
            <p className="text-center text-xs text-white/30">
              No password?{" "}
              <button onClick={() => setMode("magic")} className="text-primary hover:text-primary/80 font-semibold">
                Use a magic link instead
              </button>
            </p>
          )}
        </div>
        <p className="text-center text-xs text-white/20">Access is by invitation only. Contact your admin if you need access.</p>
      </div>
    </div>
  );
}
`,
);
console.log("Login.tsx created");

// App.tsx
fs.writeFileSync(
  "src/App.tsx",
  `import { Switch, Route, Redirect } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import Leaderboard from "@/pages/Leaderboard";
import Teams from "@/pages/Teams";
import Overview from "@/pages/Overview";
import LogActivity from "@/pages/LogActivity";
import MyStats from "@/pages/MyStats";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white/30 text-sm">Loading...</div>
    </div>
  );

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/callback">
        {user ? <Redirect to="/" /> : <Redirect to="/login" />}
      </Route>
      <Route>
        {!user ? <Redirect to="/login" /> : (
          <Layout>
            <Switch>
              <Route path="/" component={Overview} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/teams" component={Teams} />
              <Route path="/log" component={LogActivity} />
              <Route path="/me" component={MyStats} />
              <Route path="/admin" component={Admin} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}
`,
);
console.log("App.tsx created");

// main.tsx
fs.writeFileSync(
  "src/main.tsx",
  `import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/auth";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
`,
);
console.log("main.tsx created");

console.log("All auth files created successfully!");
