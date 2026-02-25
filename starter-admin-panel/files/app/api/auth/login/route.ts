import { NextResponse } from "next/server";
import { signToken, setSession } from "@/lib/auth";
import { mockUsers } from "@/lib/mock-data";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  // Mock auth — replace with real DB lookup + bcrypt compare
  const user = mockUsers.find((u) => u.email === email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  await setSession(token);

  return NextResponse.json({ success: true });
}
