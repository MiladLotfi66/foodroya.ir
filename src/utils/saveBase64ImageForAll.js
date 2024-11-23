import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // ایمپورت کتابخانه‌ی Sharp
import bcrypt from 'bcryptjs';

/**
 * Saves a base64 encoded image to a dynamically specified directory and format.
 *
 * @param {object} params - Parameters for saving the image.
 * @param {string} params.base64String - The base64 encoded image string.
 * @param {string} params.directory - The base directory where the image will be saved.
 * @param {string} params.subDirectory - The subdirectory within the base directory.
 * @param {string} params.filename - The name of the saved image file.
 * @param {string} params.format - The desired image format (default: 'webp').
 * @param {object} params.options - Additional options for image processing.
 * @returns {Promise<string>} - The path to the saved image.
 */


export async function saveBase64ImageForAll({
    base64String,
    directory,
    subDirectory = '',
    filename,
    format = 'webp',
    options = { quality: 80 },
}) {
  
    // Construct the full directory path
    const fullDirectory = path.join(directory, subDirectory);

    // Ensure the directory exists
    if (!fs.existsSync(fullDirectory)) {
        fs.mkdirSync(fullDirectory, { recursive: true });
    }

    // Decode base64 string
    const buffer = Buffer.from(base64String, 'base64');

    // Define the output path with the desired format
    const outputPath = path.join(fullDirectory, `${filename}.${format}`);

    // Initialize Sharp with the buffer
    let image = Sharp(buffer);

    // Apply format-specific processing
    switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
            image = image.jpeg({ quality: options.quality || 80 });
            break;
        case 'png':
            image = image.png({ compressionLevel: options.compressionLevel || 9 });
            break;
        case 'webp':
            image = image.webp({ quality: options.quality || 80 });
            break;
        case 'tiff':
            image = image.tiff({ quality: options.quality || 80 });
            break;
        // Add more formats as needed
        default:
            throw new Error(`Unsupported image format: ${format}`);
    }

    // Process and save the image
    await image.toFile(outputPath);

    return outputPath;
}


function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // رویداد زمانی که خواندن موفقیت‌آمیز بود
      reader.onload = () => {
        resolve(reader.result);
      };
      
      // رویداد زمانی که خطایی رخ داد
      reader.onerror = (error) => {
        reject(error);
      };
      
      // شروع فرآیند خواندن فایل به عنوان Data URL
      reader.readAsDataURL(file);
    });
  }
  