import 'dotenv/config';
import mongoose from 'mongoose';
import { Project } from '@/lib/models/Project';

async function fixProjects() {
  try {
    console.log('🔧 Réparation des projets existants...');
    
    // Connexion DB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ MongoDB connecté');
    
    // Trouver tous les projets sans imageUrl ou pdfUrl
    const projects = await Project.find({
      $or: [
        { imageUrl: { $exists: false } },
        { imageUrl: null },
        { pdfUrl: { $exists: false } },
        { pdfUrl: null }
      ]
    });
    
    console.log(`📋 ${projects.length} projets à réparer`);
    
    for (const project of projects) {
      console.log(`🔧 Réparation projet: ${project.title} (${project._id})`);
      
      // Ajouter les valeurs par défaut si manquantes
      if (!project.imageUrl) {
        project.imageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop';
        console.log(`   📸 Image ajoutée: ${project.imageUrl}`);
      }
      
      if (!project.pdfUrl) {
        project.pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        console.log(`   📄 PDF ajouté: ${project.pdfUrl}`);
      }
      
      await project.save();
      console.log(`   ✅ Projet ${project._id} réparé`);
    }
    
    console.log('🎉 Tous les projets ont été réparés!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixProjects();