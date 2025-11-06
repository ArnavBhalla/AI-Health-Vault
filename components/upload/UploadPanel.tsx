'use client';

import { useState, useRef } from 'react';
import { useCrypto } from '@/lib/crypto/useCrypto';
import { encryptFile } from '@/lib/crypto/encryption';
import toast from 'react-hot-toast';

export function UploadPanel({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    labName: '',
    value: '',
    unit: '',
    range: '',
    date: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { keyPair, hasKeys, createKeys } = useCrypto();

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, JPG, or PNG files only.');
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit. Please upload a smaller file.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !keyPair) return;

    try {
      setUploading(true);

      // Encrypt file client-side
      const encrypted = await encryptFile(file, keyPair.publicKey);

      // Upload to server
      const response = await fetch('/api/records/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lab',
          filename: file.name,
          ciphertext: encrypted.ciphertext,
          wrappedKey: encrypted.wrappedKey,
          iv: encrypted.iv,
          metadata: {
            labName: metadata.labName,
            value: metadata.value ? parseFloat(metadata.value) : undefined,
            unit: metadata.unit,
            range: metadata.range,
            date: metadata.date,
          },
          source: 'upload',
        }),
      });

      if (response.ok) {
        toast.success('Record uploaded successfully!');
        setFile(null);
        setMetadata({ labName: '', value: '', unit: '', range: '', date: '' });
        // Notify parent component to refresh
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!hasKeys) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">🔑</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Generate Encryption Keys
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Before uploading records, you need to generate your encryption keys.
          These keys will be stored securely in your browser.
        </p>
        <button
          onClick={() => createKeys()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Generate Keys
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-6xl mb-4">📤</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {file ? file.name : 'Drop your lab report here'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          or click to browse (PDF, JPG, PNG)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Metadata Form */}
      {file && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Lab Information (Optional)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lab Name
              </label>
              <input
                type="text"
                value={metadata.labName}
                onChange={(e) => setMetadata({ ...metadata, labName: e.target.value })}
                placeholder="e.g., ALT, Cholesterol"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value
              </label>
              <input
                type="number"
                step="0.01"
                value={metadata.value}
                onChange={(e) => setMetadata({ ...metadata, value: e.target.value })}
                placeholder="59"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={metadata.unit}
                onChange={(e) => setMetadata({ ...metadata, unit: e.target.value })}
                placeholder="U/L, mg/dL"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Normal Range
              </label>
              <input
                type="text"
                value={metadata.range}
                onChange={(e) => setMetadata({ ...metadata, range: e.target.value })}
                placeholder="10-40"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setFile(null)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Encrypting & Uploading...' : 'Upload Securely'}
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              End-to-End Encrypted
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Your file is encrypted in your browser before upload. The server never sees your unencrypted data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
