'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface PhotoUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxPhotos?: number;
  currentPhotoCount?: number;
  uploading?: boolean;
  disabled?: boolean;
}

export default function PhotoUpload({
  onUpload,
  maxPhotos = 3,
  currentPhotoCount = 0,
  uploading = false,
  disabled = false,
}: PhotoUploadProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<Array<{ file: File; preview: string }>>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }
    if (file.size > maxFileSize) {
      return `File size must be less than ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`;
    }
    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check total photo count
    const remainingSlots = maxPhotos - currentPhotoCount;
    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more photo(s). Maximum ${maxPhotos} photos allowed.`);
      return;
    }

    // Validate all files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Create previews
    const previewPromises = validFiles.map(async (file) => ({
      file,
      preview: await createPreview(file),
    }));

    const previewsData = await Promise.all(previewPromises);
    setPreviews(previewsData);
  }, [maxPhotos, currentPhotoCount]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || uploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled, uploading, handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleUpload = async () => {
    if (previews.length === 0) return;

    try {
      setUploadProgress(0);
      const files = previews.map((p) => p.file);
      
      // Simulate progress (since we don't have real upload progress from API)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Clear previews after successful upload
      setTimeout(() => {
        setPreviews([]);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    } catch (error) {
      setUploadProgress(0);
      // Error handling is done in parent component
    }
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const remainingSlots = maxPhotos - currentPhotoCount;
  const canUploadMore = remainingSlots > 0 && !disabled && !uploading;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {previews.length === 0 && canUploadMore && (
        <div
          ref={dropZoneRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${dragActive
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300'
            }
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-pink-400'}
          `}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-pink-100">
              <svg
                className="w-8 h-8 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {dragActive ? 'Drop photos here' : 'Drag & drop photos here'}
              </p>
              <p className="text-sm text-gray-500">
                or <span className="text-pink-600">click to browse</span>
              </p>
              <p className="text-xs text-gray-400">
                JPEG, PNG, WebP up to 5MB • {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button
                    onClick={() => removePreview(index)}
                    className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs truncate">{preview.file.name}</p>
                  <p className="text-white/80 text-xs">
                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button and Progress */}
          <div className="space-y-2">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200">
                <div
                  className="bg-gradient-to-r from-pink-600 to-red-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading || previews.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload {previews.length} Photo{previews.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setPreviews([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={uploading}
                className="px-6 py-3 border-2 border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload More Button (when previews are empty but can upload more) */}
      {previews.length === 0 && !canUploadMore && (
        <div className="text-center py-4 text-gray-500">
          <p>Maximum {maxPhotos} photos reached</p>
          <p className="text-sm mt-1">Delete a photo to upload a new one</p>
        </div>
      )}
    </div>
  );
}

