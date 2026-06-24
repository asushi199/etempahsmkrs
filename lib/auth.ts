// Pengesahan pentadbir ringkas berdasarkan kata laluan dalam pemboleh ubah persekitaran.
// Pentadbir menghantar kata laluan melalui header 'x-admin-password' pada setiap
// permintaan tulis pentadbir. Cukup untuk alat dalaman sekolah (tiada akaun pengguna).

export function checkAdminPassword(password: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD belum ditetapkan dalam persekitaran.");
  }
  if (!password) return false;
  // Perbandingan masa-tetap mudah untuk elak timing attack
  if (password.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

// Semak header permintaan; pulangkan true jika pentadbir sah.
export function isAdminRequest(req: Request): boolean {
  const pwd = req.headers.get("x-admin-password");
  return checkAdminPassword(pwd);
}
