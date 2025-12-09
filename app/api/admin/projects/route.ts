import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Project } from '@/lib/models/Project'
import { verifyToken, extractTokenFromHeader, extractTokenFromRequest } from '@/lib/utils/jwt'
import mongoose from 'mongoose'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 API /admin/projects called');
    
    // Vérifier l'authentification admin - CORRECTION ICI
    const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Utiliser la fonction qui accepte un string
    const token = extractTokenFromHeader(authHeader);
    console.log('Extracted token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ No token found in header');
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.log('Decoded token:', { email: decoded.email, role: decoded.role });
    
    if (!decoded || decoded.role !== 'admin') {
      console.log('❌ User is not admin:', decoded?.role);
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Admin uniquement' },
        { status: 403 }
      );
    }

    console.log('👤 Admin authenticated:', decoded.email);

    // Connexion à la base de données
    await connectDB();
    console.log('✅ Connected to database');

    // Essayer d'abord avec le modèle Mongoose
    try {
      console.log('📊 Fetching projects using Mongoose model...');
      
      const projects = await Project.find({})
        .select('title description shortDescription category creatorName creatorId owner fundingGoal fundedAmount goalADA raisedADA status verified backersCount createdAt updatedAt startDate endDate deadline')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`✅ Found ${projects.length} projects using Mongoose model`);

      // Transformer les projets pour l'interface admin
      const formattedProjects = projects.map(project => {
        return {
          id: project._id?.toString(),
          _id: project._id?.toString(),
          title: project.title || 'Sans titre',
          shortDescription: project.shortDescription || 
                           (project.description ? project.description.substring(0, 200) : '') || 
                           '',
          category: project.category || 'other',
          creatorName: project.creatorName || 
                      (project.owner && typeof project.owner === 'object' ? project.owner.name : 'Inconnu') || 
                      'Inconnu',
          fundingGoal: project.fundingGoal || project.goalADA || 0,
          fundedAmount: project.fundedAmount || project.raisedADA || 0,
          status: project.status || 'draft',
          verified: project.verified || false,
          backersCount: project.backersCount || 0,
          createdAt: project.createdAt || new Date(),
          updatedAt: project.updatedAt || new Date(),
          startDate: project.startDate,
          endDate: project.endDate || project.deadline,
          currency: project.currency || 'ADA'
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          projects: formattedProjects,
          count: formattedProjects.length,
          source: 'mongoose-model'
        }
      });

    } catch (mongooseError: any) {
      console.error('❌ Mongoose query failed:', mongooseError.message);
      
      // Fallback: utiliser directement la collection MongoDB
      console.log('🔄 Trying direct MongoDB collection access...');
      
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }

      const projectsCollection = db.collection('projects');
      const rawProjects = await projectsCollection.find({})
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`✅ Found ${rawProjects.length} projects using direct collection`);

      const formattedProjects = rawProjects.map(project => {
        return {
          id: project._id?.toString(),
          _id: project._id?.toString(),
          title: project.title || 'Sans titre',
          shortDescription: project.shortDescription || 
                           (project.description ? project.description.substring(0, 200) : '') || 
                           '',
          category: project.category || 'other',
          creatorName: project.creatorName || 
                      (project.owner && typeof project.owner === 'object' ? project.owner.name : 'Inconnu') || 
                      'Inconnu',
          fundingGoal: project.fundingGoal || project.goalADA || 0,
          fundedAmount: project.fundedAmount || project.raisedADA || 0,
          status: project.status || 'draft',
          verified: project.verified || false,
          backersCount: project.backersCount || 0,
          createdAt: project.createdAt || new Date(),
          updatedAt: project.updatedAt || new Date(),
          startDate: project.startDate,
          endDate: project.endDate || project.deadline,
          currency: project.currency || 'ADA'
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          projects: formattedProjects,
          count: formattedProjects.length,
          source: 'direct-collection'
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Error in /admin/projects API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Impossible de récupérer les projets',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log('✏️ API /admin/projects PUT called');
    
    // Vérifier l'authentification admin - Même correction
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Admin uniquement' },
        { status: 403 }
      );
    }

    const { projectIds, action, reason } = await req.json();

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0 || !action) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    await connectDB();

    // Valider l'action
    const validActions = ['active', 'pending', 'rejected', 'cancelled', 'failed'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action non valide' },
        { status: 400 }
      );
    }

    // Mettre à jour les projets
    const updateData: any = {
      status: action,
      updatedAt: new Date()
    };

    if (action === 'active') {
      updateData.verified = true;
      updateData.startDate = new Date();
      updateData.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    if (reason) {
      updateData.reviewNotes = reason;
      updateData.reviewedBy = decoded.email;
      updateData.reviewedAt = new Date();
    }

    // Utiliser directement la collection MongoDB
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const projectsCollection = db.collection('projects');
    
    // Convertir les IDs en ObjectId
    const objectIds = projectIds.map((id: string) => {
      try {
        if (id.startsWith('mock-') || !mongoose.Types.ObjectId.isValid(id)) {
          return id;
        }
        return new mongoose.Types.ObjectId(id);
      } catch {
        return id;
      }
    });

    // Construire la query
    const query = {
      $or: [
        { _id: { $in: objectIds.filter(id => id instanceof mongoose.Types.ObjectId) } },
        { _id: { $in: objectIds.filter(id => typeof id === 'string') } }
      ]
    };

    console.log('Updating projects with query:', query);
    console.log('Update data:', updateData);

    const result = await projectsCollection.updateMany(
      query,
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        message: `${result.modifiedCount} projet(s) mis à jour`
      }
    });

  } catch (error: any) {
    console.error('Error updating projects:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}