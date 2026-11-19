import { NextResponse } from "next/server";
import { endSession } from "@/lib/session";

export async function POST(req: Request) {
  // Same-origin check: refuse logout posts coming from other sites.
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  await endSession();
  return NextResponse.redirect(new URL("/login?loggedOut=1", req.url), 303);
}
