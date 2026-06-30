import { EventFormPage } from "@/components/admin/EventFormPage";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventFormPage eventId={id} />;
}
