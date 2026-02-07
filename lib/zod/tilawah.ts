import { z } from "zod";
export const tilawahLogSchema = z.object({
  date: z.string().min(10, "Tanggal wajib diisi"),
  surah: z.number().int().min(1).max(114),
  ayah_from: z.number().int().min(1),
  ayah_to: z.number().int().min(1),
  pages_count: z.number().int().min(0).default(0),
  notes: z.string().max(500).optional(),
}).refine((v) => v.ayah_to >= v.ayah_from, { message: "Rentang ayat tidak valid", path: ["ayah_to"] });
export type TilawahLogInput = z.infer<typeof tilawahLogSchema>;
