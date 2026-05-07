import { SessionOptions } from "iron-session";

export interface SessionData {
  userId: string;
  teamId: string;
  walletAddress: string;
  role: string;
}

const devSessionSecret =
  "onleash-local-development-session-secret-change-before-production";

const sessionPassword =
  process.env.SESSION_SECRET ??
  (process.env.NODE_ENV === "production" ? undefined : devSessionSecret);

export const sessionOptions: SessionOptions = {
  password: sessionPassword!,
  cookieName: "onleash-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};
