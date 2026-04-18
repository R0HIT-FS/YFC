import { NextResponse } from "next/server";

const LEADER_KEY = process.env.LEADER_KEY;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== LEADER_KEY) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/leaders", req.url));

  res.cookies.set("leader", "true", {
    httpOnly: true,
    path: "/",
  });

  return res;
}