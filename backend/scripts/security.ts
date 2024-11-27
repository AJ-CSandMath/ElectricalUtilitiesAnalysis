import { crypto } from 'https://deno.land/std@0.210.0/crypto/mod.ts';

export async function validateApiKey(key: string): Promise<boolean> {
  if (!key || key.length < 32) return false;

  // Basic key format validation
  const keyRegex = /^[A-Za-z0-9_-]{32,}$/;
  return keyRegex.test(key);
}

export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_');
}
