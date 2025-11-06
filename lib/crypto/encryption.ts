/**
 * Client-side encryption utilities using Web Crypto API
 *
 * Architecture:
 * 1. User has an RSA key pair (public/private)
 * 2. Each file is encrypted with a unique AES-GCM key (CEK = Content Encryption Key)
 * 3. The CEK is wrapped (encrypted) with the user's RSA public key
 * 4. Both ciphertext and wrapped CEK are stored
 * 5. To decrypt: unwrap CEK with private key, then decrypt content with CEK
 */

// Type definitions
export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptedData {
  ciphertext: ArrayBuffer;
  wrappedKey: ArrayBuffer;
  iv: ArrayBuffer;
}

export interface SerializedKeyPair {
  publicKey: string; // base64
  encryptedPrivateKey: string; // base64, encrypted with password
}

/**
 * Generate RSA-OAEP key pair for user
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['wrapKey', 'unwrapKey']
  );

  return keyPair as KeyPair;
}

/**
 * Export public key to base64 string
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import public key from base64 string
 */
export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key);
  return await crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['wrapKey']
  );
}

/**
 * Export private key encrypted with password
 */
export async function exportPrivateKey(
  privateKey: CryptoKey,
  password: string
): Promise<string> {
  // Derive key from password
  const passwordKey = await deriveKeyFromPassword(password);

  // Export private key
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);

  // Encrypt with password-derived key
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    passwordKey,
    exported
  );

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return arrayBufferToBase64(combined);
}

/**
 * Import private key (decrypt with password)
 */
export async function importPrivateKey(
  encryptedBase64: string,
  password: string
): Promise<CryptoKey> {
  const combined = base64ToArrayBuffer(encryptedBase64);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  // Derive key from password
  const passwordKey = await deriveKeyFromPassword(password);

  // Decrypt private key
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    passwordKey,
    ciphertext
  );

  // Import the decrypted private key
  return await crypto.subtle.importKey(
    'pkcs8',
    decrypted,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['unwrapKey']
  );
}

/**
 * Derive AES key from password using PBKDF2
 */
async function deriveKeyFromPassword(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Static salt for this app (in production, store per-user salt)
  const salt = enc.encode('ai-health-vault-v1');

  // Derive AES key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with AES-GCM and wrap the key with RSA public key
 */
export async function encryptData(
  data: ArrayBuffer,
  publicKey: CryptoKey
): Promise<EncryptedData> {
  // Generate a random AES key (CEK)
  const contentKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt data with CEK
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    contentKey,
    data
  );

  // Wrap (encrypt) the CEK with user's public key
  const wrappedKey = await crypto.subtle.wrapKey(
    'raw',
    contentKey,
    publicKey,
    { name: 'RSA-OAEP' }
  );

  return {
    ciphertext,
    wrappedKey,
    iv,
  };
}

/**
 * Decrypt data by unwrapping the key with RSA private key
 */
export async function decryptData(
  encryptedData: EncryptedData,
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  // Unwrap (decrypt) the CEK with user's private key
  const contentKey = await crypto.subtle.unwrapKey(
    'raw',
    encryptedData.wrappedKey,
    privateKey,
    { name: 'RSA-OAEP' },
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt data with CEK
  return await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: encryptedData.iv },
    contentKey,
    encryptedData.ciphertext
  );
}

/**
 * Encrypt a file (returns base64 strings for storage)
 */
export async function encryptFile(
  file: File,
  publicKey: CryptoKey
): Promise<{
  ciphertext: string;
  wrappedKey: string;
  iv: string;
}> {
  const fileBuffer = await file.arrayBuffer();
  const encrypted = await encryptData(fileBuffer, publicKey);

  return {
    ciphertext: arrayBufferToBase64(encrypted.ciphertext),
    wrappedKey: arrayBufferToBase64(encrypted.wrappedKey),
    iv: arrayBufferToBase64(encrypted.iv),
  };
}

/**
 * Decrypt a file
 */
export async function decryptFile(
  ciphertext: string,
  wrappedKey: string,
  iv: string,
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  const encryptedData: EncryptedData = {
    ciphertext: base64ToArrayBuffer(ciphertext),
    wrappedKey: base64ToArrayBuffer(wrappedKey),
    iv: base64ToArrayBuffer(iv),
  };

  return await decryptData(encryptedData, privateKey);
}

// Utility functions
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash data with SHA-256 (for audit log integrity)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return arrayBufferToBase64(hashBuffer);
}
