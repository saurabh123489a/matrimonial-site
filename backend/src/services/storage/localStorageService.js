import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Local File Storage Service
 * Stores files on the local filesystem
 */
export class LocalStorageService {
  constructor() {
    this.uploadBasePath = path.join(__dirname, '../../../uploads/photos');
    this.publicUrlBase = process.env.PUBLIC_URL_BASE || 'http://localhost:5050';
    this.ensureUploadDirectory();
  }

  async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadBasePath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  /**
   * Upload a file to local storage
   * @param {Buffer|string} file - File buffer or file path
   * @param {string} filename - Filename to save as
   * @param {string} userId - User ID for organizing files
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadFile(file, filename, userId) {
    const filePath = path.join(this.uploadBasePath, filename);
    
    // If file is a path, copy it; if it's a buffer, write it
    if (typeof file === 'string') {
      await fs.copyFile(file, filePath);
    } else {
      await fs.writeFile(filePath, file);
    }

    const url = `${this.publicUrlBase}/uploads/photos/${filename}`;
    
    return {
      url,
      path: filePath,
    };
  }

  /**
   * Delete a file from local storage
   * @param {string} filePath - File path or URL
   * @returns {Promise<boolean>}
   */
  async deleteFile(filePath) {
    try {
      // Extract filename from URL if needed
      let localPath = filePath;
      if (filePath.includes('/uploads/photos/')) {
        const filename = filePath.split('/uploads/photos/')[1];
        localPath = path.join(this.uploadBasePath, filename);
      }
      
      await fs.unlink(localPath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file URL from path or return existing URL
   * @param {string} filePath - File path
   * @returns {string}
   */
  getFileUrl(filePath) {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath; // Already a URL
    }
    
    const filename = path.basename(filePath);
    return `${this.publicUrlBase}/uploads/photos/${filename}`;
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

