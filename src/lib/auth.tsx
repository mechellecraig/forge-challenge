import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  // Tracks whether we're mid-member-fetch after a sign-in so App doesn't
  // prematurely show SelectProfile
  const [memberLoading, setMemberLoading] = useState(false);
  const initialised = useRef(false);

  async function fetchMember(userId: string) {
    const { data } = await supabase.from("members").select("*").eq("user_id", userId).single();
    setMember(data || null);
  }

  useEffect(() => {
    // Resolve the initial session on mount — keeps the app in loading until done
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) await fetchMember(session.user.id);
      initialised.current = true;
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip the INITIAL_SESSION event — getSession() above handles it
      if (!initialised.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Hold the app in a "member loading" state so it doesn't flash SelectProfile
        setMemberLoading(true);
        await fetchMember(session.user.id);
        setMemberLoading(false);
      } else {
        setMember(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setMember(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, member, loading: loading || memberLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
