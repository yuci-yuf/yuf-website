import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  createEventDeskToken,
  eventDeskErrorResponse,
  EventDeskError,
  requireFullAdmin,
} from "@/lib/event-desk-server";
import type { EventDeskLink } from "@/types";

export const dynamic = "force-dynamic";

function iso(value: unknown): string | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }
  return null;
}

async function assertLocation(
  eventId: string,
  locationId: string,
): Promise<void> {
  if (!eventId || !locationId) {
    throw new EventDeskError(400, "Event and location are required.");
  }
  const event = await getAdminDb().collection("events").doc(eventId).get();
  if (!event.exists) throw new EventDeskError(404, "Event not found.");
  const data = event.data()!;
  const valid = Array.isArray(data.locations) && data.locations.length > 0
    ? data.locations.some(
        (location: Record<string, unknown>) => location.id === locationId,
      )
    : locationId === "default";
  if (!valid) throw new EventDeskError(404, "Event location not found.");
}

export async function GET(request: Request) {
  try {
    await requireFullAdmin(request);
    const eventId = new URL(request.url).searchParams.get("eventId")?.trim();
    if (!eventId) {
      throw new EventDeskError(400, "Event is required.");
    }
    const snapshot = await getAdminDb()
      .collection("eventAccessLinks")
      .where("eventId", "==", eventId)
      .get();
    const links: EventDeskLink[] = snapshot.docs
      .map((document) => {
        const data = document.data();
        return {
          token: document.id,
          eventId: String(data.eventId ?? ""),
          locationId: String(data.locationId ?? ""),
          active: data.active === true,
          createdAt: iso(data.createdAt),
        };
      })
      .filter((link) => link.active);
    return Response.json({ links });
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const adminUid = await requireFullAdmin(request);
    const body = await request.json();
    const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
    const locationId =
      typeof body.locationId === "string" ? body.locationId.trim() : "";
    await assertLocation(eventId, locationId);

    const db = getAdminDb();
    const existing = await db
      .collection("eventAccessLinks")
      .where("eventId", "==", eventId)
      .get();
    const batch = db.batch();
    for (const document of existing.docs) {
      if (
        document.data().active === true &&
        document.data().locationId === locationId
      ) {
        batch.update(document.ref, {
          active: false,
          revokedAt: FieldValue.serverTimestamp(),
          revokedBy: adminUid,
        });
      }
    }

    const token = createEventDeskToken();
    batch.set(db.collection("eventAccessLinks").doc(token), {
      eventId,
      locationId,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: adminUid,
    });
    await batch.commit();
    return Response.json({ token }, { status: 201 });
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUid = await requireFullAdmin(request);
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) throw new EventDeskError(400, "Link token is required.");
    const reference = getAdminDb().collection("eventAccessLinks").doc(token);
    const snapshot = await reference.get();
    if (!snapshot.exists) throw new EventDeskError(404, "Link not found.");
    await reference.update({
      active: false,
      revokedAt: FieldValue.serverTimestamp(),
      revokedBy: adminUid,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
}
