import { IronSessionOptions } from "iron-session";

export interface SessionData {
  userId: string;
  teamId: string;
  walletAddress: string;
  role: string;
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "onleash-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};
