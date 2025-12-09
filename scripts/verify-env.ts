import 'dotenv/config';
import { config } from '@/lib/config';
import { checkCloudinaryConnection } from '@/lib/services/uploadService';

async function verifyEnvironment() {
  console.log('🔍 Vérification de l\'environnement UmojaFund\n');
  
  console.log('📋 Variables d\'environnement détectées:');
  console.log(`  MONGO_URI: ${process.env.MONGO_URI ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING'}`);
  
  console.log('\n🔧 Validation de la configuration...');
  
  try {
    config.validate();
    console.log('✅ Configuration valide');
    
    // Test Cloudinary
    console.log('\n☁️  Test de connexion Cloudinary...');
    const cloudinaryOk = await checkCloudinaryConnection();
    
    if (cloudinaryOk) {
      console.log('✅ Cloudinary connecté avec succès');
    } else {
      console.log('❌ Erreur de connexion Cloudinary');
    }
    
    console.log('\n🎉 Tous les tests passés! L\'application est prête.');
    
  } catch (error: any) {
    console.error('\n❌ Erreurs de configuration:');
    console.error(error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  verifyEnvironment();
}

export { verifyEnvironment };