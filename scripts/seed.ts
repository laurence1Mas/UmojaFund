import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/models/User';
import { Project } from '@/lib/models/Project';

async function seedDatabase() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Nettoyer la base de données
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('🗑️ Database cleaned');

    // Créer un admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin Umoja',
      email: 'admin@umojafund.com',
      passwordHash: adminPassword,
      role: 'admin',
      walletAddress: 'addr_test1qp8c6a...',
    });

    // Créer des utilisateurs normaux
    const userPassword = await bcrypt.hash('user123', 10);
    const user1 = await User.create({
      name: 'Jean Kabasele',
      email: 'jean@example.com',
      passwordHash: userPassword,
      walletAddress: 'addr_test1qra7d5...',
    });

    const user2 = await User.create({
      name: 'Marie Lumbala',
      email: 'marie@example.com',
      passwordHash: userPassword,
      walletAddress: 'addr_test1qs9f3g...',
    });

    // Créer des projets
    const projects = [
      {
        title: 'Ferme Agricole Communautaire',
        description: 'Création d\'une ferme agricole pour l\'autosuffisance alimentaire dans la région du Kasaï.',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
        pdfUrl: 'https://example.com/project1.pdf',
        goalADA: 50000,
        raisedADA: 12500,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
        owner: user1._id,
        status: 'active',
      },
      {
        title: 'Atelier de Couture pour Femmes',
        description: 'Formation et équipement d\'un atelier de couture pour 20 femmes à Kinshasa.',
        imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
        pdfUrl: 'https://example.com/project2.pdf',
        goalADA: 25000,
        raisedADA: 8000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        owner: user2._id,
        status: 'active',
      },
      {
        title: 'Centre de Santé Mobile',
        description: 'Équipement d\'un véhicule pour des soins de santé mobiles dans les zones rurales.',
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc',
        pdfUrl: 'https://example.com/project3.pdf',
        goalADA: 75000,
        raisedADA: 0,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        owner: admin._id,
        status: 'pending',
      },
    ];

    for (const projectData of projects) {
      await Project.create(projectData);
    }

    console.log('✅ Database seeded successfully');
    console.log('\n📋 Test credentials:');
    console.log('Admin: admin@umojafund.com / admin123');
    console.log('User 1: jean@example.com / user123');
    console.log('User 2: marie@example.com / user123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();