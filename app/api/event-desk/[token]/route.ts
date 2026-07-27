import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  eventDeskErrorResponse,
  EventDeskError,
  loadEventDeskData,
  requireActiveDesk,
  safeDeskRegistration,
} from "@/lib/event-desk-server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const data = await loadEventDeskData(token);
    return Response.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const scope = await requireActiveDesk(token);
    const body = await request.json();
    const registrationId =
      typeof body.registrationId === "string"
        ? body.registrationId.trim()
        : "";
    if (!registrationId) {
      throw new EventDeskError(400, "Registration is required.");
    }

    const db = getAdminDb();
    const reference = db.collection("registrations").doc(registrationId);
    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) {
        throw new EventDeskError(404, "Registration not found.");
      }
      const data = snapshot.data()!;
      const registrationLocation =
        String(data.locationId ?? "") || "default";
      if (
        data.eventId !== scope.eventId ||
        registrationLocation !== scope.locationId
      ) {
        throw new EventDeskError(403, "Registration is outside this event desk.");
      }
      if (data.status !== "confirmed") {
        throw new EventDeskError(400, "Only confirmed registrations can check in.");
      }
      const registration = safeDeskRegistration(snapshot.id, data);
      if (registration.checkedIn) {
        return { result: "already" as const, registration };
      }
      transaction.update(reference, {
        checkedIn: true,
        checkedInAt: FieldValue.serverTimestamp(),
        checkedInBy: `event-desk:${scope.eventId}:${scope.locationId}`,
      });
      return {
        result: "ok" as const,
        registration: { ...registration, checkedIn: true },
      };
    });

    return Response.json(result);
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
}
