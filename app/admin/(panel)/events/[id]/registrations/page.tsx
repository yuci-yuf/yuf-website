import { EventRegistrations } from "@/components/admin/EventRegistrations";

export default async function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventRegistrations eventId={id} />;
}
