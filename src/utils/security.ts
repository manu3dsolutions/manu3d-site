// Utilitaire de hachage SHA-256
// Transforme "MonMotDePasse" en "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Vérifie si une chaîne ressemble à un hash SHA-256 (64 caractères hexadécimaux)
export function isHash(str: string): boolean {
    const regex = /^[a-f0-9]{64}$/i;
    return regex.test(str);
}