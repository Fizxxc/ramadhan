import { z } from "zod";
export const memorizationLogSchema = z.object({
  date: z.string().min(10, "Tanggal wajib diisi"),
  surah: z.number().int().min(1).max(114),
  ayah_from: z.number().int().min(1),
  ayah_to: z.number().int().min(1),
  type: z.enum(["baru","murajaah"], { required_error: "Tipe wajib dipilih" }),
  notes: z.string().max(500).optional(),
}).refine((v) => v.ayah_to >= v.ayah_from, { message: "Rentang ayat tidak valid", path: ["ayah_to"] });
export type MemorizationLogInput = z.infer<typeof memorizationLogSchema>;
