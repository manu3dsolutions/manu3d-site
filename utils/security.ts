// Ce fichier est obsolète car l'authentification Admin locale a été supprimée.
// Nous conservons des stubs vides pour éviter les erreurs d'import si des références persistent.

export async function hashPassword(password: string): Promise<string> {
  return "";
}

export function isHash(str: string): boolean {
  return false;
}