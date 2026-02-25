import { NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await getSession();

  if (session) {
    await logAction({
      userId: session.sub,
      action: "user.logout",
      entityType: "session",
      ipAddress: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
    });
  }

  await clearSession();
  return NextResponse.json({ success: true });
}
