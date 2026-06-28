"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ContactsProvider } from "@/contexts/ContactsContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <ContactsProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 overflow-x-hidden">{children}</div>
      </div>
    </ContactsProvider>
  );
}
