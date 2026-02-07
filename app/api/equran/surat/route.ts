import { NextResponse } from "next/server";
import { equranFetch } from "@/lib/equran/client";

export async function GET() {
  try {
    const json = await equranFetch("/surat");
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ code: 500, message: e?.message ?? "Gagal memuat", data: null }, { status: 500 });
  }
}
