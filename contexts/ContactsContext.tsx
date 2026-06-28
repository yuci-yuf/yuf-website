"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getContactMessages } from "@/lib/admin-data";

interface ContactsState {
  /** Number of unread contact messages, for the sidebar badge. */
  unreadCount: number;
  /** Re-fetch the unread count (call after read/unread/delete actions). */
  refresh: () => void;
}

const ContactsContext = createContext<ContactsState | null>(null);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  function refresh() {
    getContactMessages()
      .then((msgs) => setUnreadCount(msgs.filter((m) => !m.isRead).length))
      .catch((e) => console.error("ContactsProvider: failed to load count", e));
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo<ContactsState>(
    () => ({ unreadCount, refresh }),
    [unreadCount],
  );

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts(): ContactsState {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within a ContactsProvider");
  return ctx;
}
