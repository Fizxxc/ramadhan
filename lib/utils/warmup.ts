export async function warmup(ms = 350) {
  // delay kecil supaya Next menampilkan route loading saat navigasi
  await new Promise((r) => setTimeout(r, ms));
}
