import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project'; // Assurez-vous que c'est le bon chemin
import { verifyToken } from '@/lib/utils/jwt';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/projects/user called');
    
    // 1. Authentification via token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('❌ No authorization header');
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Extraire le token
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      );
    }
    
    // Vérifier le token
    const decoded = verifyToken(token);
    console.log('👤 User authenticated:', decoded.email);
    
    // 2. Connexion à la base de données
    await connectDB();
    
    // 3. Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const skip = (page - 1) * limit;
    
    console.log('Query params:', { page, limit, status, category, userId: decoded.userId });
    
    // 4. Construire la requête
    // OPTION A: Projets où l'utilisateur est créateur (owner/creator)
    const queryAsCreator: any = {
      $or: [
        { creatorId: new mongoose.Types.ObjectId(decoded.userId) },
        { owner: new mongoose.Types.ObjectId(decoded.userId) }
      ]
    };
    
    // OPTION B: Projets où l'utilisateur a investi
    const queryAsInvestor: any = {
      'investors.userId': new mongoose.Types.ObjectId(decoded.userId)
    };
    
    if (status) {
      queryAsCreator.status = status;
      queryAsInvestor.status = status;
    }
    
    if (category) {
      queryAsCreator.category = category;
      queryAsInvestor.category = category;
    }
    
    try {
      // 5. Récupérer les projets (créateur + investisseur)
      const [projectsAsCreator, projectsAsInvestor] = await Promise.all([
        Project.find(queryAsCreator)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Project.find(queryAsInvestor)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);
      
      console.log(`📊 Found ${projectsAsCreator.length} projects as creator`);
      console.log(`📊 Found ${projectsAsInvestor.length} projects as investor`);
      
      // 6. Combiner et dédupliquer les projets
      const allProjectsMap = new Map();
      
      [...projectsAsCreator, ...projectsAsInvestor].forEach(project => {
        const projectId = project._id.toString();
        if (!allProjectsMap.has(projectId)) {
          allProjectsMap.set(projectId, {
            ...project,
            userRole: projectsAsCreator.some(p => p._id.toString() === projectId) ? 'creator' : 'investor'
          });
        }
      });
      
      const allProjects = Array.from(allProjectsMap.values());
      
      // 7. Formater les projets
      const formattedProjects = allProjects.map(project => {
        const userInvestment = project.investors?.find(
          (inv: any) => inv.userId && inv.userId.toString() === decoded.userId
        ) || null;
        
        // Calculer le ROI
        let userROI = '0.0';
        if (userInvestment && userInvestment.amount && userInvestment.amount > 0) {
          userROI = ((userInvestment.returns || 0) / userInvestment.amount * 100).toFixed(1);
        }
        
        // Calculer le progrès
        const fundingGoal = project.fundingGoal || project.goalADA || 1;
        const fundedAmount = project.fundedAmount || project.raisedADA || 0;
        const progress = Math.min(100, (fundedAmount / fundingGoal) * 100);
        
        // Jours restants
        const endDate = project.endDate || project.deadline || new Date();
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        );
        
        return {
          id: project._id.toString(),
          _id: project._id.toString(),
          title: project.title || 'Sans titre',
          shortDescription: project.shortDescription || 
                          (project.description ? project.description.substring(0, 200) : '') || 
                          '',
          category: project.category || 'other',
          status: project.status || 'draft',
          verified: project.verified || false,
          featured: project.featured || false,
          userRole: project.userRole, // 'creator' ou 'investor'
          
          // Funding info
          fundingGoal,
          fundedAmount,
          progress: Math.round(progress),
          backersCount: project.backersCount || 0,
          daysLeft,
          
          // User investment (si investisseur)
          userInvestment: userInvestment ? {
            amount: userInvestment.amount || 0,
            date: userInvestment.date || project.createdAt,
            returns: userInvestment.returns || 0,
            roi: `${userROI}%`,
          } : null,
          
          // Project details
          creatorName: project.creatorName || 'Inconnu',
          startDate: project.startDate,
          endDate: endDate,
          expectedROI: project.expectedROI || 0,
          minInvestment: project.minInvestment || 0,
          milestones: project.milestones?.length || 0,
          images: project.images || [],
          
          createdAt: project.createdAt || new Date(),
          updatedAt: project.updatedAt || new Date(),
        };
      });
      
      // 8. Pagination
      const [totalAsCreator, totalAsInvestor] = await Promise.all([
        Project.countDocuments(queryAsCreator),
        Project.countDocuments(queryAsInvestor)
      ]);
      
      // Compter les projets uniques (sans duplication)
      const total = await Project.countDocuments({
        $or: [queryAsCreator, queryAsInvestor]
      });
      
      console.log(`✅ Returning ${formattedProjects.length} projects to user`);
      
      // 9. Retourner la réponse
      return NextResponse.json({
        success: true,
        data: {
          projects: formattedProjects,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          summary: {
            totalInvested: formattedProjects
              .filter(p => p.userInvestment)
              .reduce((sum, p) => sum + (p.userInvestment?.amount || 0), 0),
            totalReturns: formattedProjects
              .filter(p => p.userInvestment)
              .reduce((sum, p) => sum + (p.userInvestment?.returns || 0), 0),
            activeProjects: formattedProjects.filter(p => p.status === 'active').length,
            completedProjects: formattedProjects.filter(p => p.status === 'completed').length,
            asCreator: totalAsCreator,
            asInvestor: totalAsInvestor,
          },
        },
      });
      
    } catch (queryError: any) {
      console.error('❌ Database query error:', queryError);
      
      // Fallback: utiliser la collection MongoDB directement
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const projectsCollection = db.collection('projects');
      
      // Simple requête pour l'utilisateur
      const userProjects = await projectsCollection.find({
        $or: [
          { creatorId: new mongoose.Types.ObjectId(decoded.userId) },
          { owner: new mongoose.Types.ObjectId(decoded.userId) },
          { 'investors.userId': new mongoose.Types.ObjectId(decoded.userId) }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      
      const formattedProjects = userProjects.map(project => ({
        id: project._id.toString(),
        title: project.title || 'Sans titre',
        status: project.status || 'draft',
        fundingGoal: project.fundingGoal || project.goalADA || 0,
        fundedAmount: project.fundedAmount || project.raisedADA || 0,
        createdAt: project.createdAt || new Date(),
      }));
      
      return NextResponse.json({
        success: true,
        data: {
          projects: formattedProjects,
          pagination: {
            page,
            limit,
            total: formattedProjects.length,
            totalPages: 1,
          },
        },
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error in /api/projects/user:', error);
    
    // Retourner une réponse vide plutôt qu'une erreur
    return NextResponse.json({
      success: true,
      data: {
        projects: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        summary: {
          totalInvested: 0,
          totalReturns: 0,
          activeProjects: 0,
          completedProjects: 0,
          asCreator: 0,
          asInvestor: 0,
        },
      },
    });
  }
}