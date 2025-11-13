import { userRepository } from '../repositories/userRepository.js';
import { processPhoto } from '../utils/imageProcessor.js';
import { storageService } from '../services/storage/storageService.js';
import { sortPhotos } from '../utils/photoUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload photos for user profile
 * Maximum 3 photos allowed
 */
export const uploadPhotos = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No photos uploaded'
      });
    }

    // Get current user
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Check current photo count
    const currentPhotoCount = user.photos?.length || 0;
    const newPhotoCount = req.files.length;

    if (currentPhotoCount + newPhotoCount > 3) {
      return res.status(400).json({
        status: false,
        message: `Maximum 3 photos allowed. You have ${currentPhotoCount} photos and trying to upload ${newPhotoCount}.`
      });
    }

    // Process all uploaded photos
    const processedPhotos = [];
    for (const file of req.files) {
      try {
        // Process photo (resize, watermark, etc.)
        const processedPath = await processPhoto(file.path, userId);
        
        // Generate unique filename
        const filename = path.basename(processedPath);
        
        // Upload to storage (local or blob)
        const uploadResult = await storageService.uploadFile(processedPath, filename, userId);
        
        processedPhotos.push({
          url: uploadResult.url,
          isPrimary: currentPhotoCount === 0 && processedPhotos.length === 0, // First photo is primary
          order: currentPhotoCount + processedPhotos.length,
        });

        // Delete temporary files (processed and original)
        await fs.unlink(file.path).catch(() => {});
        await fs.unlink(processedPath).catch(() => {});
      } catch (error) {
        console.error('Error processing photo:', error);
      }
    }

    // Update user photos - ensure primary photo is first
    const existingPhotos = user.photos || [];
    const updatedPhotos = [...existingPhotos, ...processedPhotos];
    
    // Sort photos: primary first, then by order
    sortPhotos(updatedPhotos);

    // Update user
    const updatedUser = await userRepository.updateById(userId, {
      photos: updatedPhotos
    });

    res.json({
      status: true,
      message: `${processedPhotos.length} photo(s) uploaded successfully`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a photo
 */
export const deletePhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { photoIndex } = req.params;

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    const photos = user.photos || [];
    const index = parseInt(photoIndex);

    if (index < 0 || index >= photos.length) {
      return res.status(400).json({
        status: false,
        message: 'Invalid photo index'
      });
    }

    // Get photo URL to delete from storage
    const photoToDelete = photos[index];
    
    // Remove photo from array
    const updatedPhotos = photos.filter((_, i) => i !== index);
    
    // If deleted photo was primary, make first photo primary
    if (photos[index].isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }

    // Reorder photos and ensure primary is first
    updatedPhotos.forEach((photo, i) => {
      photo.order = i;
    });
    
    // Sort: primary photo first, then by order
    sortPhotos(updatedPhotos);

    // Delete file from storage (local or blob)
    if (photoToDelete?.url) {
      await storageService.deleteFile(photoToDelete.url).catch((error) => {
        console.error('Error deleting photo from storage:', error);
        // Continue even if deletion fails
      });
    }

    // Update user
    const updatedUser = await userRepository.updateById(userId, {
      photos: updatedPhotos
    });

    res.json({
      status: true,
      message: 'Photo deleted successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set primary photo
 */
export const setPrimaryPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { photoIndex } = req.params;

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    const photos = user.photos || [];
    const index = parseInt(photoIndex);

    if (index < 0 || index >= photos.length) {
      return res.status(400).json({
        status: false,
        message: 'Invalid photo index'
      });
    }

    // Update all photos - set only the selected one as primary
    const updatedPhotos = photos.map((photo, i) => ({
      ...photo,
      isPrimary: i === index
    }));
    
    // Sort photos: primary first, then by order
    sortPhotos(updatedPhotos);

    // Update user
    const updatedUser = await userRepository.updateById(userId, {
      photos: updatedPhotos
    });

    res.json({
      status: true,
      message: 'Primary photo updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

