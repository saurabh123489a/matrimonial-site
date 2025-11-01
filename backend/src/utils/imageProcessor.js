import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add watermark (application name) to image
 */
export async function addWatermark(imagePath, outputPath) {
  try {
    const appName = 'EK Gahoi'; // Application name
    const watermarkText = appName;
    
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Create watermark SVG
    const svgText = `
      <svg width="${width}" height="${height}">
        <text
          x="50%"
          y="50%"
          font-family="Arial, sans-serif"
          font-size="${Math.min(width, height) / 10}"
          font-weight="bold"
          fill="rgba(255, 255, 255, 0.6)"
          text-anchor="middle"
          dominant-baseline="middle"
          stroke="rgba(0, 0, 0, 0.3)"
          stroke-width="2"
        >
          ${watermarkText}
        </text>
      </svg>
    `;

    // Add watermark to image
    await sharp(imagePath)
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        }
      ])
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
}

/**
 * Process and optimize uploaded photo
 */
export async function processPhoto(inputPath, userId) {
  try {
    const outputFilename = `processed-${Date.now()}-${userId}.jpg`;
    const outputPath = path.join(__dirname, '../../uploads/photos', outputFilename);

    // Resize and optimize image
    await sharp(inputPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Add watermark
    const watermarkedPath = path.join(__dirname, '../../uploads/photos', `watermarked-${outputFilename}`);
    await addWatermark(outputPath, watermarkedPath);

    // Clean up original processed file
    await fs.unlink(outputPath).catch(() => {});

    // Return the watermarked image path
    return watermarkedPath;
  } catch (error) {
    console.error('Error processing photo:', error);
    throw error;
  }
}

