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
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  /**
   * A signed-in user is an admin only if a document exists at
   * `admins/{their-uid}` (managed manually in the Firebase console). Merely
   * being authenticated is NOT enough — this matches `isAdmin()` in
   * firestore.rules and keeps any non-allowlisted account (e.g. from another
   * enabled sign-in provider) out of the panel.
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
    let active = true;
    const unsub = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      // Admin status is gated on an allowlist doc, not just being signed in.
      if (!current) {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      let allowed = false;
      try {
        const snap = await getDoc(doc(db, "admins", current.uid));
        allowed = snap.exists();
      } catch {
        // A denied/failed read means "not an admin" — fail closed.
        allowed = false;
      }
      if (active) {
        setIsAdmin(allowed);
        setLoading(false);
      }
    });
    return () => {
      active = false;
      unsub();
    };
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
