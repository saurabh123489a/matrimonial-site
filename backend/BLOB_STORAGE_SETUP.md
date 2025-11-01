# Blob Storage Setup Guide

This guide explains how to migrate from local file storage to cloud blob storage (Azure Blob Storage, AWS S3, or Google Cloud Storage).

## Current Setup

Currently, the application uses **local file storage** by default. Files are stored in the `uploads/photos/` directory on the server.

## Architecture

The application uses a **storage service abstraction layer** that allows easy switching between storage types:

- `LocalStorageService` - Stores files on local filesystem (current)
- `BlobStorageService` - Stores files in cloud blob storage (future)

## Configuration

Set the storage type in your `.env` file:

```env
STORAGE_TYPE=local  # or 'blob' for cloud storage
PUBLIC_URL_BASE=http://localhost:5050  # Base URL for local storage
```

## Migrating to Blob Storage

### Option 1: Azure Blob Storage

1. **Install the Azure SDK:**
```bash
cd backend
npm install @azure/storage-blob
```

2. **Update `blobStorageService.js`:**
```javascript
import { BlobServiceClient } from '@azure/storage-blob';

export class BlobStorageService {
  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_CONTAINER_NAME || 'matrimonial-photos';
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  async uploadFile(file, filename, userId) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
    
    // Read file if it's a path
    let fileBuffer = file;
    if (typeof file === 'string') {
      const fs = await import('fs/promises');
      fileBuffer = await fs.readFile(file);
    }
    
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' }
    });
    
    return {
      url: blockBlobClient.url,
      path: filename
    };
  }

  async deleteFile(filePath) {
    const blobName = filePath.split('/').pop(); // Extract blob name from URL
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return true;
  }

  getFileUrl(filePath) {
    // filePath is already the blob name
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    return blockBlobClient.url;
  }

  async fileExists(filePath) {
    const blobName = filePath.split('/').pop();
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return await blockBlobClient.exists();
  }
}
```

3. **Environment Variables:**
```env
STORAGE_TYPE=blob
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_CONTAINER_NAME=matrimonial-photos
```

### Option 2: AWS S3

1. **Install AWS SDK:**
```bash
cd backend
npm install @aws-sdk/client-s3
```

2. **Update `blobStorageService.js`:**
```javascript
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export class BlobStorageService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  async uploadFile(file, filename, userId) {
    let fileBuffer = file;
    if (typeof file === 'string') {
      const fs = await import('fs/promises');
      fileBuffer = await fs.readFile(file);
    }

    const key = `photos/${userId}/${filename}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read', // or 'private' with signed URLs
    }));

    const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    return {
      url,
      path: key
    };
  }

  async deleteFile(filePath) {
    // Extract key from URL or use filePath directly
    const key = filePath.includes('amazonaws.com/') 
      ? filePath.split('amazonaws.com/')[1]
      : filePath;

    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    }));
    
    return true;
  }

  getFileUrl(filePath) {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;
  }

  async fileExists(filePath) {
    const key = filePath.includes('amazonaws.com/') 
      ? filePath.split('amazonaws.com/')[1]
      : filePath;

    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  }
}
```

3. **Environment Variables:**
```env
STORAGE_TYPE=blob
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
```

### Option 3: Google Cloud Storage

1. **Install Google Cloud SDK:**
```bash
cd backend
npm install @google-cloud/storage
```

2. **Update `blobStorageService.js`:**
```javascript
import { Storage } from '@google-cloud/storage';

export class BlobStorageService {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE, // or use credentials object
    });
    this.bucketName = process.env.GCS_BUCKET_NAME;
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async uploadFile(file, filename, userId) {
    const fileBuffer = typeof file === 'string' 
      ? await (await import('fs/promises')).readFile(file)
      : file;

    const blob = this.bucket.file(`photos/${userId}/${filename}`);
    await blob.save(fileBuffer, {
      contentType: 'image/jpeg',
      metadata: {
        metadata: {
          userId: userId,
        },
      },
    });

    // Make public (or use signed URLs for private files)
    await blob.makePublic();

    return {
      url: blob.publicUrl(),
      path: `photos/${userId}/${filename}`
    };
  }

  async deleteFile(filePath) {
    const blobName = filePath.includes('storage.googleapis.com/')
      ? filePath.split('storage.googleapis.com/')[1].split('/').slice(1).join('/')
      : filePath;

    const blob = this.bucket.file(blobName);
    await blob.delete();
    return true;
  }

  getFileUrl(filePath) {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const blob = this.bucket.file(filePath);
    return blob.publicUrl();
  }

  async fileExists(filePath) {
    const blobName = filePath.includes('storage.googleapis.com/')
      ? filePath.split('storage.googleapis.com/')[1].split('/').slice(1).join('/')
      : filePath;

    const blob = this.bucket.file(blobName);
    const [exists] = await blob.exists();
    return exists;
  }
}
```

3. **Environment Variables:**
```env
STORAGE_TYPE=blob
GCP_PROJECT_ID=your-project-id
GCP_KEY_FILE=path/to/keyfile.json
GCS_BUCKET_NAME=your-bucket-name
```

## Migration Steps

1. **Choose your blob storage provider** (Azure, AWS, or GCP)

2. **Install the appropriate SDK** (see examples above)

3. **Update `blobStorageService.js`** with your implementation

4. **Set environment variables** for your blob storage

5. **Update `.env`** to set `STORAGE_TYPE=blob`

6. **Test the migration** by uploading a photo

7. **Migrate existing files** (optional script to copy existing photos to blob storage)

## Benefits of Blob Storage

- ✅ Scalability - Handle unlimited storage
- ✅ CDN Integration - Faster file delivery
- ✅ Reliability - Built-in redundancy
- ✅ Cost-effective - Pay only for what you use
- ✅ Global Access - Serve files from edge locations

## Notes

- The storage service automatically falls back to local storage if blob storage is not properly configured
- Existing photos in local storage will continue to work until migrated
- Photo URLs in the database will be updated automatically when new photos are uploaded

