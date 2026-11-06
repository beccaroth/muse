import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { flushSync } from 'react-dom';
import { db } from '@/lib/db';

type Session = NonNullable<
  Awaited<ReturnType<typeof db.auth.getSession>>['data']['session']
>;

export interface AuthContext {
  isAuthenticated: boolean;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Neon's adapter only relays auth events from *other* tabs (it drops events whose
    // client ID matches this tab), so this listener keeps tabs in sync but does not
    // fire for this tab's own sign-in or sign-out. login/logout set state directly.
    const { data: { subscription } } = db.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // flushSync commits the new session before the caller continues, so the
  // router.invalidate() that follows re-runs beforeLoad guards against the updated
  // auth context instead of the stale one.
  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    flushSync(() => setSession(data.session));
  }, []);

  const logout = useCallback(async () => {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    flushSync(() => setSession(null));
  }, []);

  return (
    <AuthCtx.Provider value={{
      isAuthenticated: !!session,
      session,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
