import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({
  user: null as any,
  session: null as any,
  member: null as any,
  loading: true,
  signOut: async () => {},
});

// Wrap a promise with a timeout. If the promise doesn't resolve in `ms` milliseconds,
// the wrapper rejects with a timeout error. This is the key defense against
// Supabase's known hang-on-tab-suspension bug.
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Track the current user ID so visibility handler can decide whether to re-fetch.
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          5000,
          "getSession",
        );
        if (!mounted) return;
        const sess = data.session;
        setSession(sess);
        setUser(sess?.user ?? null);
        currentUserIdRef.current = sess?.user?.id ?? null;
      } catch (err) {
        // getSession hung or failed. Best we can do is treat the user as logged-out.
        // They'll see the login screen and can re-auth. Much better than a stuck loading screen.
        console.warn(
          "[auth] session load failed, treating as unauthenticated:",
          err,
        );
        if (!mounted) return;
        setSession(null);
        setUser(null);
        currentUserIdRef.current = null;
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSession();

    // Supabase official guidance: do NOT await other Supabase calls inside this callback.
    // Doing so can cause deadlocks. We only update basic session state here; the member
    // fetch happens in a separate effect that watches `user`.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      currentUserIdRef.current = sess?.user?.id ?? null;
      if (!sess?.user) setMember(null);
      setLoading(false);
    });

    // Tab visibility handler — when the user returns after backgrounding, re-verify
    // the session. If Supabase's client got corrupted during suspension (a known issue),
    // this is our chance to recover without forcing a page refresh.
    async function handleVisibility() {
      if (document.visibilityState !== "visible") return;
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          5000,
          "visibility getSession",
        );
        if (!mounted) return;
        const sess = data.session;
        // Only update if something meaningfully changed, to avoid state churn.
        const newUserId = sess?.user?.id ?? null;
        if (newUserId !== currentUserIdRef.current) {
          setSession(sess);
          setUser(sess?.user ?? null);
          currentUserIdRef.current = newUserId;
          if (!sess?.user) setMember(null);
        }
      } catch (err) {
        console.warn("[auth] visibility session check failed:", err);
        // Don't forcibly log the user out here — they may just be offline briefly.
        // The app's own queries will surface errors if the session is really dead.
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Separate effect for member fetch. Runs whenever `user` changes.
  // Kept out of the auth callback per Supabase's deadlock guidance.
  useEffect(() => {
    let cancelled = false;

    async function loadMember() {
      if (!user) {
        setMember(null);
        return;
      }
      try {
        const { data } = await withTimeout(
          supabase.from("members").select("*").eq("user_id", user.id).single(),
          5000,
          "fetchMember",
        );
        if (cancelled) return;
        setMember(data || null);
      } catch (err) {
        console.warn("[auth] fetchMember failed:", err);
        // On timeout, leave member as whatever it was. Don't flash null → SelectProfile.
        // If the user truly has no member record, the initial load succeeded with null
        // and we're already showing SelectProfile correctly.
      }
    }

    loadMember();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMember(null);
    currentUserIdRef.current = null;
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
