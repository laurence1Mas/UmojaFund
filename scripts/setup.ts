import 'dotenv/config';
import { config } from '@/lib/config';

console.log('🚀 Setup UmojaFund\n');

console.log('📋 Configuration actuelle:');
console.log(`  MongoDB: ${config.mongoUri ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`  JWT Secret: ${config.jwtSecret ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`  Cloudinary: ${config.cloudinary.cloudName ? '✅ Configuré' : '❌ Manquant'}`);
console.log(`  Mode: ${config.isProduction ? 'Production' : 'Développement'}`);
console.log(`  URL App: ${config.appUrl}`);

console.log('\n📝 Instructions:');
console.log('1. Vérifier que MongoDB Atlas est accessible');
console.log('2. Vérifier que Cloudinary est configuré');
console.log('3. Démarrer le serveur: npm run dev');
console.log('4. Tester: curl http://localhost:3000/api/health');

console.log('\n🔗 URLs importantes:');
console.log(`  API: ${config.apiUrl}`);
console.log(`  Frontend: ${config.appUrl}`);
console.log(`  MongoDB Atlas: ${config.mongoUri.split('@')[1]?.split('/')[0] || 'N/A'}`);

console.log('\n✅ Setup complet!');