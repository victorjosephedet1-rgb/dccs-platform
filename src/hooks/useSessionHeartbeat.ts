import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSessionHeartbeat(intervalMs: number = 300000) {
  useEffect(() => {
    const heartbeat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[SESSION] Heartbeat - session active');
      } else {
        console.log('[SESSION] Heartbeat - no active session');
      }
    };

    heartbeat();

    const interval = setInterval(heartbeat, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}
