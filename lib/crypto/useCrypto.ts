'use client';

import { useState, useEffect } from 'react';
import {
  generateKeyPair,
  exportPublicKey,
  exportPrivateKey,
  importPrivateKey,
  importPublicKey,
  KeyPair,
} from './encryption';

// IndexedDB for storing keys locally
const DB_NAME = 'ai-health-vault-keys';
const STORE_NAME = 'keys';

/**
 * Hook for managing user's cryptographic keys
 */
export function useCrypto() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  /**
   * Load keys from IndexedDB
   */
  async function loadKeys() {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('userKeyPair');

      request.onsuccess = async () => {
        const data = request.result;
        if (data) {
          // Keys exist, but we need password to decrypt private key
          // For MVP, we'll skip password and store unencrypted in IndexedDB
          // In production, prompt for password here
          const publicKey = await importPublicKey(data.publicKey);
          const privateKey = await importPrivateKey(data.encryptedPrivateKey, 'temp-password');

          setKeyPair({ publicKey, privateKey });
        }
        setIsLoading(false);
      };

      request.onerror = () => {
        setError('Failed to load keys');
        setIsLoading(false);
      };
    } catch (err) {
      console.error('Error loading keys:', err);
      setIsLoading(false);
    }
  }

  /**
   * Generate new key pair and save to IndexedDB
   */
  async function createKeys(password: string = 'temp-password') {
    try {
      setIsLoading(true);
      const newKeyPair = await generateKeyPair();

      const publicKeyB64 = await exportPublicKey(newKeyPair.publicKey);
      const encryptedPrivateKey = await exportPrivateKey(newKeyPair.privateKey, password);

      // Save to IndexedDB
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await store.put(
        {
          publicKey: publicKeyB64,
          encryptedPrivateKey,
        },
        'userKeyPair'
      );

      setKeyPair(newKeyPair);
      setIsLoading(false);

      return { publicKeyB64, encryptedPrivateKey };
    } catch (err) {
      console.error('Error creating keys:', err);
      setError('Failed to create keys');
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Clear keys (logout)
   */
  async function clearKeys() {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.delete('userKeyPair');
    setKeyPair(null);
  }

  return {
    keyPair,
    isLoading,
    error,
    createKeys,
    clearKeys,
    hasKeys: !!keyPair,
  };
}

/**
 * Open IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}
