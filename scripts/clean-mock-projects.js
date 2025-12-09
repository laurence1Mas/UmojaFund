const mongoose = require('mongoose');
require('dotenv').config();

async function cleanMockProjects() {
  try {
    // Connexion à MongoDB
    const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/umojafund';
    
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Accéder à la collection projects
    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');
    
    // Trouver les projets avec des IDs commençant par "moc"
    const mockProjects = await projectsCollection.find({ 
      $or: [
        { _id: { $regex: /^moc/, $options: 'i' } },
        { id: { $regex: /^moc/, $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`📊 Trouvé ${mockProjects.length} projets mock`);
    
    if (mockProjects.length === 0) {
      console.log('✅ Aucun projet mock à supprimer');
      return;
    }
    
    // Afficher les projets trouvés
    console.log('\n📋 Projets mock trouvés :');
    mockProjects.forEach(project => {
      console.log(`  - ID: ${project._id || project.id}, Titre: ${project.title || 'Sans titre'}`);
    });
    
    // Demander confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(`\n❓ Voulez-vous supprimer ces ${mockProjects.length} projets ? (oui/non) `, async (answer) => {
      if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o') {
        console.log('🗑️  Suppression en cours...');
        
        // Supprimer les projets
        const deleteQuery = {
          $or: [
            { _id: { $regex: /^moc/, $options: 'i' } },
            { id: { $regex: /^moc/, $options: 'i' } }
          ]
        };
        
        const result = await projectsCollection.deleteMany(deleteQuery);
        
        console.log(`✅ ${result.deletedCount} projets mock supprimés avec succès !`);
      } else {
        console.log('❌ Suppression annulée');
      }
      
      readline.close();
      await mongoose.disconnect();
      console.log('👋 Déconnexion de MongoDB');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
cleanMockProjects();