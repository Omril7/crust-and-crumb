// src/hooks/useSupabaseSession.js
import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { supabase } from "../supabaseClient";

export function useSupabaseSession() {
  const [session, setSession] = useLocalStorage("CCSupabaseSession", null);

  useEffect(() => {
    async function initSession() {
      if (!session) return;

      const now = Math.floor(Date.now() / 1000); // seconds
      if (session.expires_at < now) {
        // refresh token
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: session.refresh_token
        });

        if (!error && data?.session) {
          setSession(data.session);
        } else {
          setSession(null); // expired + failed refresh
        }
      }
    }

    initSession();

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, [session, setSession]);

  return { session, setSession };
}
