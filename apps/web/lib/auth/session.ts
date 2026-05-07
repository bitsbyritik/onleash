import { SessionOptions } from "iron-session";

export interface SessionData {
  userId: string;
  teamId: string;
  walletAddress: string;
  role: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "onleash-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};
