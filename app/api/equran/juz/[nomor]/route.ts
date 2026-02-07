import { NextResponse } from "next/server";
import { equranFetch } from "@/lib/equran/client";

export async function GET(_req: Request, ctx: { params: { nomor: string } }) {
  try {
    const n = Number(ctx.params.nomor);
    const json = await equranFetch(`/juz/${n}`);
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ code: 500, message: e?.message ?? "Gagal memuat", data: null }, { status: 500 });
  }
}
