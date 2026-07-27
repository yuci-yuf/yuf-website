import type { Metadata } from "next";
import { DialogProvider } from "@/components/ui/confirm-dialog";
import { EventDesk } from "@/components/public/EventDesk";

export const metadata: Metadata = {
  title: "Event Desk",
  referrer: "no-referrer",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function EventDeskPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <DialogProvider>
      <EventDesk token={token} />
    </DialogProvider>
  );
}
