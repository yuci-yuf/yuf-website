"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  /**
   * Single-admin model: any signed-in Firebase Auth user is the admin. The
   * admin account is created manually in the Firebase console, and email/
   * password is the only sign-in method exposed, so no extra allowlist or
   * `admins` collection is needed.
   */
  isAdmin: boolean;
  /** True while the initial auth check is resolving. */
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      // Any signed-in user is the admin (single-admin model).
      setIsAdmin(Boolean(current));
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAdmin,
      loading,
      signInEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signOut: async () => {
        await fbSignOut(auth);
      },
    }),
    [user, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
