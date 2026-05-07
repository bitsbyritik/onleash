import { NextResponse } from "next/server";

export function isDatabaseUnavailable(error: unknown) {
  const message = String(error);
  return (
    message.includes("ECONNREFUSED") ||
    message.includes("Connection terminated") ||
    message.includes("password authentication failed") ||
    message.includes("28P01") ||
    message.includes("DATABASE_URL")
  );
}

export function databaseUnavailable() {
  return NextResponse.json(
    {
      error:
        "Database unavailable or misconfigured. Check DATABASE_URL, restart Next.js, then run the Drizzle schema push.",
    },
    { status: 503 },
  );
}
