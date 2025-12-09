export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue!;
};

export const config = {
  // MongoDB
  mongoUri: getEnv('MONGO_URI'),
  
  // JWT
  jwtSecret: getEnv('JWT_SECRET'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
  
  // Cloudinary - version simple
  cloudinaryCloudName: getEnv('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: getEnv('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: getEnv('CLOUDINARY_API_SECRET'),
  
  // URLs
  appUrl: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  apiUrl: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  validate() {
    const required = [
      'MONGO_URI',
      'JWT_SECRET',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
    
    return true;
  },
};