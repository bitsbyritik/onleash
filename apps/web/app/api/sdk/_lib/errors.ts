import { NextResponse } from "next/server";

export const Errors = {
  unauthorized: () =>
    NextResponse.json({ message: "Invalid API key" }, { status: 401 }),
  forbidden: () =>
    NextResponse.json({ message: "Access denied" }, { status: 403 }),
  notFound: (r: string) =>
    NextResponse.json({ message: `${r} not found` }, { status: 404 }),
  badRequest: (m: string) =>
    NextResponse.json({ message: m }, { status: 400 }),
  internal: () =>
    NextResponse.json({ message: "Internal error" }, { status: 500 }),
};
