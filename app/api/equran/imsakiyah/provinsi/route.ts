import { NextResponse } from "next/server";

export const revalidate = 60 * 60 * 24;

export async function GET() {
  const res = await fetch("https://equran.id/api/v2/imsakiyah/provinsi", {
    next: { revalidate },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
