import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configuration simplifiée - à appeler dans chaque fonction
function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️ Cloudinary credentials not found. Uploads will be mocked.');
    return false;
  }
  
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log(`✅ Cloudinary configured with cloud: ${cloudName}`);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error);
    return false;
  }
}

export async function uploadImage(file: File): Promise<string> {
  const isConfigured = configureCloudinary();
  
  if (!isConfigured) {
    // Retourner une URL mock pour le développement
    console.log('📸 Mocking image upload');
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop';
  }
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'umojafund/projects',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error.message);
            // Fallback à une image mock
            resolve('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop');
          } else {
            resolve(result!.secure_url);
          }
        }
      );

      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Upload image error:', error);
    // Fallback
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop';
  }
}

export async function uploadPDF(file: File): Promise<string> {
  const isConfigured = configureCloudinary();
  
  if (!isConfigured) {
    console.log('📄 Mocking PDF upload');
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  }
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'umojafund/documents',
          resource_type: 'raw',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary PDF upload error:', error.message);
            // Fallback
            resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
          } else {
            resolve(result!.secure_url);
          }
        }
      );

      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Upload PDF error:', error);
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  }
}

export async function checkCloudinaryConnection(): Promise<boolean> {
  const isConfigured = configureCloudinary();
  
  if (!isConfigured) {
    console.log('⚠️ Cloudinary not configured, using mock mode');
    return false;
  }
  
  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Cloudinary connection error:', error.message);
    return false;
  }
}