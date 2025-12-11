import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { Contribution } from '@/lib/models/Contribution';
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
    const userId = decoded.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID utilisateur non trouvé' },
        { status: 401 }
      );
    }
    
    console.log('👤 User authenticated:', decoded.email, 'ID:', userId);
    
    // 2. Connexion à la base de données
    await connectDB();
    
    // 3. Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const skip = (page - 1) * limit;
    
    console.log('Query params:', { page, limit, status, category, userId });
    
    try {
      // 4. Récupérer les contributions de l'utilisateur
      const userContributions = await Contribution.find({ 
        user: new mongoose.Types.ObjectId(userId),
        status: 'confirmed' // Seulement les contributions confirmées
      })
      .populate('project')
      .lean();
      
      console.log(`📊 Found ${userContributions.length} contributions for user`);
      
      // 5. Récupérer les projets uniques de l'utilisateur
      const projectIds = [...new Set(
        userContributions
          .map(c => c.project?._id?.toString())
          .filter(Boolean) as string[]
      )];
      
      console.log(`📊 Unique project IDs: ${projectIds.length}`);
      
      // 6. Construire la requête pour les projets (créateur + contributeur)
      const queryAsCreator: any = {
        $or: [
          { creatorId: new mongoose.Types.ObjectId(userId) },
          { owner: new mongoose.Types.ObjectId(userId) }
        ]
      };
      
      const queryAsContributor: any = {
        _id: { $in: projectIds.map(id => new mongoose.Types.ObjectId(id)) }
      };
      
      // Appliquer les filtres
      if (status) {
        queryAsCreator.status = status;
        queryAsContributor.status = status;
      }
      
      if (category) {
        queryAsCreator.category = category;
        queryAsContributor.category = category;
      }
      
      // 7. Récupérer les projets (créateur + contributeur)
      const [projectsAsCreator, projectsAsContributor] = await Promise.all([
        Project.find(queryAsCreator)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Project.find(queryAsContributor)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);
      
      console.log(`📊 Found ${projectsAsCreator.length} projects as creator`);
      console.log(`📊 Found ${projectsAsContributor.length} projects as contributor`);
      
      // 8. Combiner et dédupliquer les projets
      const allProjectsMap = new Map();
      
      [...projectsAsCreator, ...projectsAsContributor].forEach(project => {
        const projectId = project._id.toString();
        if (!allProjectsMap.has(projectId)) {
          allProjectsMap.set(projectId, {
            ...project,
            userRole: projectsAsCreator.some(p => p._id.toString() === projectId) ? 'creator' : 'contributor'
          });
        }
      });
      
      const allProjects = Array.from(allProjectsMap.values());
      
      // 9. Formater les projets avec les contributions
      const formattedProjects = allProjects.map(project => {
        // Trouver toutes les contributions de l'utilisateur pour ce projet
        const projectContributions = userContributions.filter(
          c => c.project && c.project._id.toString() === project._id.toString()
        );
        
        const totalContributed = projectContributions.reduce(
          (sum, c) => sum + (c.amountADA || 0), 
          0
        );
        
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
        
        // Calculer le ROI attendu
        let expectedROI = project.expectedROI || 0;
        let potentialReturns = 0;
        
        if (expectedROI > 0 && totalContributed > 0) {
          potentialReturns = totalContributed * (expectedROI / 100);
        }
        
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
          userRole: allProjectsMap.get(project._id.toString())?.userRole || 'contributor',
          
          // Funding info
          fundingGoal,
          fundedAmount,
          progress: Math.round(progress),
          backersCount: project.backersCount || 0,
          daysLeft,
          
          // User contributions
          userContribution: projectContributions.length > 0 ? {
            totalAmount: totalContributed,
            contributionsCount: projectContributions.length,
            firstContributionDate: projectContributions[0]?.createdAt || new Date(),
            lastContributionDate: projectContributions[projectContributions.length - 1]?.createdAt || new Date(),
            expectedReturns: potentialReturns,
            roi: `${expectedROI.toFixed(1)}%`,
          } : null,
          
          // Project details
          creatorName: project.creatorName || 'Inconnu',
          creatorId: project.creatorId?.toString(),
          startDate: project.startDate,
          endDate: endDate,
          expectedROI,
          minInvestment: project.minInvestment || 0,
          milestones: project.milestones?.length || 0,
          images: project.images || [],
          
          createdAt: project.createdAt || new Date(),
          updatedAt: project.updatedAt || new Date(),
        };
      });
      
      // 10. Pagination
      const [totalAsCreator, totalAsContributor] = await Promise.all([
        Project.countDocuments(queryAsCreator),
        Project.countDocuments(queryAsContributor)
      ]);
      
      // Compter les projets uniques (sans duplication)
      const uniqueQuery = {
        $or: [
          { 
            $or: [
              { creatorId: new mongoose.Types.ObjectId(userId) },
              { owner: new mongoose.Types.ObjectId(userId) }
            ] 
          },
          { 
            _id: { $in: projectIds.map(id => new mongoose.Types.ObjectId(id)) } 
          }
        ]
      };
      
      if (status) {
        uniqueQuery.$or.forEach((condition: any) => {
          condition.status = status;
        });
      }
      
      if (category) {
        uniqueQuery.$or.forEach((condition: any) => {
          condition.category = category;
        });
      }
      
      const total = await Project.countDocuments(uniqueQuery);
      
      console.log(`✅ Returning ${formattedProjects.length} projects to user`);
      
      // 11. Calculer le résumé
      const activeProjects = formattedProjects.filter(p => p.status === 'active');
      const completedProjects = formattedProjects.filter(p => p.status === 'completed');
      
      const totalContributed = formattedProjects
        .filter(p => p.userContribution)
        .reduce((sum, p) => sum + (p.userContribution?.totalAmount || 0), 0);
      
      const totalExpectedReturns = formattedProjects
        .filter(p => p.userContribution)
        .reduce((sum, p) => sum + (p.userContribution?.expectedReturns || 0), 0);
      
      // 12. Retourner la réponse
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
            totalContributed,
            totalExpectedReturns,
            activeProjects: activeProjects.length,
            completedProjects: completedProjects.length,
            totalContributions: userContributions.length,
            asCreator: totalAsCreator,
            asContributor: totalAsContributor,
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
      const contributionsCollection = db.collection('contributions');
      
      // Trouver les contributions de l'utilisateur
      const userContributions = await contributionsCollection.find({
        user: new mongoose.Types.ObjectId(userId),
        status: 'confirmed'
      }).toArray();
      
      // Extraire les IDs de projets uniques
      const projectIds = [...new Set(
        userContributions
          .map(c => c.project?.toString())
          .filter(Boolean) as string[]
      )];
      
      // Récupérer les projets
      const userProjects = await projectsCollection.find({
        $or: [
          { creatorId: new mongoose.Types.ObjectId(userId) },
          { owner: new mongoose.Types.ObjectId(userId) },
          { _id: { $in: projectIds.map(id => new mongoose.Types.ObjectId(id)) } }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      
      // Formater les projets simples
      const formattedProjects = userProjects.map(project => {
        // Calculer le total contribué pour ce projet
        const projectContributions = userContributions.filter(
          c => c.project?.toString() === project._id.toString()
        );
        
        const totalContributed = projectContributions.reduce(
          (sum, c) => sum + (c.amountADA || 0), 
          0
        );
        
        return {
          id: project._id.toString(),
          title: project.title || 'Sans titre',
          status: project.status || 'draft',
          fundingGoal: project.fundingGoal || project.goalADA || 0,
          fundedAmount: project.fundedAmount || project.raisedADA || 0,
          userContribution: projectContributions.length > 0 ? {
            totalAmount: totalContributed,
            contributionsCount: projectContributions.length
          } : null,
          createdAt: project.createdAt || new Date(),
        };
      });
      
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
          summary: {
            totalContributed: userContributions.reduce((sum, c) => sum + (c.amountADA || 0), 0),
            totalExpectedReturns: 0,
            activeProjects: formattedProjects.filter(p => p.status === 'active').length,
            completedProjects: formattedProjects.filter(p => p.status === 'completed').length,
            totalContributions: userContributions.length,
            asCreator: 0,
            asContributor: 0,
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
          totalContributed: 0,
          totalExpectedReturns: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalContributions: 0,
          asCreator: 0,
          asContributor: 0,
        },
      },
    });
  }
}