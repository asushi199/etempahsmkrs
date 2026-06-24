// Pembantu sisi-klien untuk sesi pentadbir (disimpan dalam sessionStorage).
// Kata laluan disahkan melalui /api/admin/verify; kekal semasa sesi tab sahaja.

export const ADMIN_PWD_KEY = "smkrs_admin_pwd";

export function getAdminPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_PWD_KEY);
}

export function setAdminPassword(pwd: string): void {
  sessionStorage.setItem(ADMIN_PWD_KEY, pwd);
}

export function clearAdminPassword(): void {
  sessionStorage.removeItem(ADMIN_PWD_KEY);
}
