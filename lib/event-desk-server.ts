import "server-only";

import { randomBytes } from "node:crypto";
import type { DocumentData } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type {
  EventDeskData,
  EventDeskRegistration,
  EventLocation,
} from "@/types";

export class EventDeskError extends Error {
  constructor(
    public status: 400 | 401 | 403 | 404,
    message: string,
  ) {
    super(message);
  }
}

function timestampIso(value: unknown): string | null {
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

function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) {
    throw new EventDeskError(401, "Authentication required.");
  }
  const token = header.slice(7).trim();
  if (!token) throw new EventDeskError(401, "Authentication required.");
  return token;
}

export async function requireFullAdmin(request: Request): Promise<string> {
  try {
    const user = await getAdminAuth().verifyIdToken(bearerToken(request));
    const admin = await getAdminDb().collection("admins").doc(user.uid).get();
    if (!admin.exists) throw new EventDeskError(403, "Admin access required.");
    return user.uid;
  } catch (error) {
    if (error instanceof EventDeskError) throw error;
    throw new EventDeskError(401, "Your session is invalid or has expired.");
  }
}

export function createEventDeskToken(): string {
  return randomBytes(32).toString("base64url");
}

function locationFromEvent(
  event: DocumentData,
  locationId: string,
): EventLocation | null {
  if (Array.isArray(event.locations) && event.locations.length > 0) {
    const location = event.locations.find(
      (item: Record<string, unknown>) => item.id === locationId,
    );
    if (!location) return null;
    return {
      id: String(location.id),
      city: typeof location.city === "string" ? location.city : undefined,
      address:
        typeof location.address === "string" ? location.address : undefined,
      date: typeof location.date === "string" ? location.date : undefined,
    };
  }

  if (locationId !== "default") return null;
  return {
    id: "default",
    city: typeof event.district === "string" ? event.district : undefined,
    address: typeof event.venue === "string" ? event.venue : undefined,
    date: typeof event.date === "string" ? event.date : undefined,
  };
}

export async function requireActiveDesk(token: string): Promise<{
  eventId: string;
  locationId: string;
  event: DocumentData;
  location: EventLocation;
}> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    throw new EventDeskError(404, "This event-desk link is invalid.");
  }
  const db = getAdminDb();
  const link = await db.collection("eventAccessLinks").doc(token).get();
  if (!link.exists || link.data()?.active !== true) {
    throw new EventDeskError(
      404,
      "This event-desk link is invalid or has been revoked.",
    );
  }
  const eventId = String(link.data()?.eventId ?? "");
  const locationId = String(link.data()?.locationId ?? "");
  const eventSnapshot = await db.collection("events").doc(eventId).get();
  if (!eventSnapshot.exists) {
    throw new EventDeskError(404, "This event is no longer available.");
  }
  const event = eventSnapshot.data()!;
  const location = locationFromEvent(event, locationId);
  if (!location) {
    throw new EventDeskError(404, "This event location is no longer available.");
  }
  return { eventId, locationId, event, location };
}

export function safeDeskRegistration(
  id: string,
  data: DocumentData,
): EventDeskRegistration {
  return {
    id,
    firstName: typeof data.firstName === "string" ? data.firstName : "",
    lastName: typeof data.lastName === "string" ? data.lastName : "",
    email: typeof data.email === "string" ? data.email : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    institution:
      typeof data.institution === "string" ? data.institution : "",
    institutionType:
      data.institutionType === "school" || data.institutionType === "college"
        ? data.institutionType
        : "",
    ageCategory:
      typeof data.ageCategory === "string" ? data.ageCategory : "",
    registrationCode:
      typeof data.registrationCode === "string" ? data.registrationCode : "",
    checkedIn: data.checkedIn === true,
    checkedInAt: timestampIso(data.checkedInAt),
    createdAt: timestampIso(data.createdAt),
  };
}

export async function loadEventDeskData(
  token: string,
): Promise<EventDeskData> {
  const scope = await requireActiveDesk(token);
  const snapshot = await getAdminDb()
    .collection("registrations")
    .where("eventId", "==", scope.eventId)
    .get();
  const registrations = snapshot.docs
    .filter((document) => {
      const data = document.data();
      return (
        data.status === "confirmed" &&
        (String(data.locationId ?? "") || "default") === scope.locationId
      );
    })
    .map((document) =>
      safeDeskRegistration(document.id, document.data()),
    )
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return {
    event: {
      id: scope.eventId,
      title: typeof scope.event.title === "string" ? scope.event.title : "",
      category:
        typeof scope.event.category === "string" ? scope.event.category : "",
    },
    location: scope.location,
    registrations,
  };
}

export function eventDeskErrorResponse(error: unknown): Response {
  if (error instanceof EventDeskError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json(
    { error: "The request could not be completed." },
    { status: 500 },
  );
}
