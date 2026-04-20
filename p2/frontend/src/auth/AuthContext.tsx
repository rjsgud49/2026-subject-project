import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setToken, getToken, type AuthUser, type UserRole } from '../lib/api';

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (email: string, name: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const USER_KEY = 'p2_user_json';

function loadStoredUser(): AuthUser | null {
  try {
    const s = localStorage.getItem(USER_KEY);
    if (!s) return null;
    return JSON.parse(s) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => (getToken() ? loadStoredUser() : null));
  const [ready, setReady] = useState(!getToken());

  const persistUser = useCallback((u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const refreshMe = useCallback(async () => {
    const t = getToken();
    if (!t) {
      persistUser(null);
      setReady(true);
      return;
    }
    try {
      const me = await api.auth.me();
      persistUser(me);
    } catch {
      setToken(null);
      persistUser(null);
    } finally {
      setReady(true);
    }
  }, [persistUser]);

  useEffect(() => {
    if (getToken()) void refreshMe();
    else setReady(true);
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await api.auth.login({ email, password });
      setToken(r.access_token);
      persistUser(r.user);
      setReady(true);
      return r.user;
    },
    [persistUser],
  );

  const signup = useCallback(
    async (email: string, name: string, password: string) => {
      const r = await api.auth.signup({ email, name, password });
      setToken(r.access_token);
      persistUser(r.user);
      setReady(true);
      return r.user;
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    setToken(null);
    persistUser(null);
  }, [persistUser]);

  const value = useMemo(
    () => ({ user, ready, login, signup, logout, refreshMe }),
    [user, ready, login, signup, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function roleHome(role: UserRole): string {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/student';
}
