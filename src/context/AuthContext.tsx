import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface AuthCtx {
  ready: boolean;
  session: Session | null;
  isAdmin: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error) return false;
  return data?.role === "admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    // GoTrueClient processes getSession()/onAuthStateChange under an internal
    // lock. Awaiting another Supabase call inside those callbacks deadlocks
    // that lock, which then hangs every later request on this client. Defer
    // with setTimeout so it runs after the lock is released.
    function syncIsAdmin(userId: string) {
      setTimeout(() => {
        fetchIsAdmin(userId).then((admin) => {
          if (active) setIsAdmin(admin);
        });
      }, 0);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) syncIsAdmin(data.session.user.id);
      else setIsAdmin(false);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) syncIsAdmin(s.user.id);
      else setIsAdmin(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }

  return (
    <Ctx.Provider
      value={{
        ready,
        session,
        isAdmin,
        configured: isSupabaseConfigured,
        signIn,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
