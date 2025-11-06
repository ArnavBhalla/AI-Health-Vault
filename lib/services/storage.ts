import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';

export class StorageService {
  /**
   * Initialize storage directories
   */
  static async init() {
    const dirs = [
      STORAGE_PATH,
      path.join(STORAGE_PATH, 'records'),
      path.join(STORAGE_PATH, 'temp'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Save encrypted file to local storage
   * @param encryptedData - The encrypted file buffer
   * @param userId - User ID for organizing files
   * @param originalFilename - Original filename for reference
   * @returns Path to the saved file
   */
  static async saveEncryptedFile(
    encryptedData: Buffer,
    userId: string,
    originalFilename: string
  ): Promise<string> {
    await this.init();

    // Generate unique filename
    const fileId = randomUUID();
    const ext = path.extname(originalFilename);
    const filename = `${fileId}${ext}.enc`;

    // Create user directory
    const userDir = path.join(STORAGE_PATH, 'records', userId);
    await fs.mkdir(userDir, { recursive: true });

    // Save file
    const filePath = path.join(userDir, filename);
    await fs.writeFile(filePath, encryptedData);

    // Return relative path for storage in DB
    return path.join('records', userId, filename);
  }

  /**
   * Read encrypted file from storage
   * @param relativePath - Path relative to STORAGE_PATH
   * @returns Encrypted file buffer
   */
  static async readEncryptedFile(relativePath: string): Promise<Buffer> {
    const filePath = path.join(STORAGE_PATH, relativePath);
    return await fs.readFile(filePath);
  }

  /**
   * Delete encrypted file from storage
   * @param relativePath - Path relative to STORAGE_PATH
   */
  static async deleteEncryptedFile(relativePath: string): Promise<void> {
    const filePath = path.join(STORAGE_PATH, relativePath);
    await fs.unlink(filePath);
  }

  /**
   * Get full path for a relative storage path
   */
  static getFullPath(relativePath: string): string {
    return path.join(STORAGE_PATH, relativePath);
  }

  /**
   * Save temporary file (for processing before encryption)
   */
  static async saveTempFile(data: Buffer, filename: string): Promise<string> {
    await this.init();

    const fileId = randomUUID();
    const ext = path.extname(filename);
    const tempFilename = `${fileId}${ext}`;
    const filePath = path.join(STORAGE_PATH, 'temp', tempFilename);

    await fs.writeFile(filePath, data);
    return path.join('temp', tempFilename);
  }

  /**
   * Clean up temporary files older than 1 hour
   */
  static async cleanupTempFiles(): Promise<void> {
    const tempDir = path.join(STORAGE_PATH, 'temp');
    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > oneHour) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning temp files:', error);
    }
  }
}

// Export convenience functions
export const saveFile = StorageService.saveEncryptedFile;
export const readFile = StorageService.readEncryptedFile;
export const deleteFile = StorageService.deleteEncryptedFile;
