import { LocalStorageService } from './localStorageService.js';
import { BlobStorageService } from './blobStorageService.js';

/**
 * Storage Service Factory
 * Provides a unified interface for file storage that can switch between
 * local storage and cloud blob storage based on configuration.
 */
class StorageService {
  constructor() {
    const storageType = process.env.STORAGE_TYPE || 'local'; // 'local' or 'blob'
    
    if (storageType === 'blob') {
      try {
        this.storage = new BlobStorageService();
      } catch (error) {
        console.warn('⚠️  Blob storage not configured, falling back to local storage:', error.message);
        this.storage = new LocalStorageService();
      }
    } else {
      this.storage = new LocalStorageService();
    }
    
    console.log(`📦 Using ${storageType} storage`);
  }

  /**
   * Upload a file
   * @param {Buffer|string} file - File buffer or file path
   * @param {string} filename - Filename to save as
   * @param {string} userId - User ID for organizing files
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadFile(file, filename, userId) {
    return await this.storage.uploadFile(file, filename, userId);
  }

  /**
   * Delete a file
   * @param {string} filePath - File path or URL
   * @returns {Promise<boolean>}
   */
  async deleteFile(filePath) {
    return await this.storage.deleteFile(filePath);
  }

  /**
   * Get file URL
   * @param {string} filePath - File path
   * @returns {string}
   */
  getFileUrl(filePath) {
    return this.storage.getFileUrl(filePath);
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath) {
    return await this.storage.fileExists(filePath);
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;

