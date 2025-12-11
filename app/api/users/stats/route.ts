// app/api/users/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { Contribution } from '@/lib/models/Contribution';
import { verifyToken } from '@/lib/utils/jwt';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/users/stats called');
    
    // 1. Authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    const userId = decoded.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID utilisateur non trouvé' },
        { status: 401 }
      );
    }
    
    console.log('👤 User ID:', userId);
    
    // 2. Connexion à la base de données
    await connectDB();
    
    // 3. Calculer les statistiques EN TEMPS RÉEL
    const stats = await calculateRealTimeStats(userId);
    
    console.log('📈 Stats calculated successfully:', stats);
    
    // 4. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalFunded: stats.totalFunded || 0,
          totalDeposits: stats.totalDeposits || 0,
          totalReturns: stats.totalReturns || 0,
          portfolioValue: stats.portfolioValue || 0,
          activeProjects: stats.activeProjects || 0,
          totalContributions: stats.totalContributions || 0,
          pendingReturns: stats.pendingReturns || 0,
          successRate: stats.successRate || 0,
          lastUpdated: new Date().toISOString(),
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error in /api/users/stats:', error);
    
    // DEBUG: Log l'erreur complète
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Retourner des statistiques par défaut en cas d'erreur
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalFunded: 0,
          totalDeposits: 0,
          totalReturns: 0,
          portfolioValue: 0,
          activeProjects: 0,
          totalContributions: 0,
          pendingReturns: 0,
          successRate: 0,
          lastUpdated: new Date().toISOString(),
        }
      }
    });
  }
}

async function calculateRealTimeStats(userId: string) {
  console.log('🔍 Starting real-time stats calculation for user:', userId);
  
  try {
    // Convertir l'ID utilisateur en ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // DEBUG: Vérifier si l'ObjectId est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid user ID:', userId);
      throw new Error('ID utilisateur invalide');
    }
    
    // 1. Récupérer TOUTES les contributions de l'utilisateur
    const contributions = await Contribution.find({ 
      user: userObjectId,
      status: 'confirmed' // Seulement les contributions confirmées
    })
    .populate('project', 'title status endDate fundingGoal')
    .lean();
    
    console.log(`📊 Found ${contributions.length} confirmed contributions`);
    
    // DEBUG: Voir les contributions
    contributions.forEach((contribution, index) => {
      console.log(`Contribution ${index + 1}:`, {
        amountADA: contribution.amountADA,
        status: contribution.status,
        projectTitle: contribution.project?.title,
        projectStatus: contribution.project?.status,
        createdAt: contribution.createdAt
      });
    });
    
    // 2. Récupérer les projets où l'utilisateur a contribué
    const projectIds = [...new Set(contributions.map(c => c.project?._id?.toString()).filter(Boolean))];
    
    let userProjects = [];
    if (projectIds.length > 0) {
      userProjects = await Project.find({
        _id: { $in: projectIds.map(id => new mongoose.Types.ObjectId(id)) }
      }).lean();
    }
    
    console.log(`📊 Found ${userProjects.length} projects with contributions`);
    
    // 3. Calculer les statistiques de base
    const totalFunded = contributions.reduce((sum, c) => sum + (Number(c.amountADA) || 0), 0);
    
    console.log('💰 Total funded from contributions:', totalFunded);
    
    // 4. Calculer la valeur du portefeuille
    let portfolioValue = 0;
    let activeProjectsCount = 0;
    
    // Grouper les contributions par projet
    const contributionsByProject: Record<string, any> = {};
    
    contributions.forEach(contribution => {
      const projectId = contribution.project?._id?.toString();
      if (!projectId) return;
      
      if (!contributionsByProject[projectId]) {
        contributionsByProject[projectId] = {
          totalAmount: 0,
          project: contribution.project,
          contributions: []
        };
      }
      
      contributionsByProject[projectId].totalAmount += Number(contribution.amountADA) || 0;
      contributionsByProject[projectId].contributions.push(contribution);
    });
    
    // Calculer la valeur pour chaque projet
    Object.values(contributionsByProject).forEach((projectData: any) => {
      const project = projectData.project;
      const totalContributed = projectData.totalAmount;
      
      if (project.status === 'active') {
        // Pour les projets actifs, la valeur est le montant contribué
        portfolioValue += totalContributed;
        activeProjectsCount++;
      } else if (project.status === 'completed') {
        // Pour les projets terminés, calculer les retours
        // Ici, vous devrez adapter selon votre logique de ROI
        // Par exemple : portfolioValue += totalContributed * (1 + project.expectedROI/100)
        portfolioValue += totalContributed; // Pour simplifier
      }
    });
    
    console.log('🎯 Portfolio value:', portfolioValue);
    
    // 5. Calculer le taux de succès
    const completedProjects = userProjects.filter(p => p.status === 'completed').length;
    const totalProjects = userProjects.length;
    const successRate = totalProjects > 0 
      ? parseFloat(((completedProjects / totalProjects) * 100).toFixed(1))
      : 0;
    
    console.log('📈 Success rate:', successRate, '%');
    
    // 6. Autres statistiques
    const totalDeposits = 0; // À implémenter si vous avez un système de dépôt
    const totalReturns = 0;  // À implémenter si vous avez un système de retour
    const pendingReturns = 0;
    const totalContributions = contributions.length;
    
    const stats = {
      totalFunded,
      totalDeposits,
      totalReturns,
      portfolioValue,
      activeProjects: activeProjectsCount,
      totalContributions,
      pendingReturns,
      successRate,
    };
    
    console.log('✅ Final stats calculated:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error calculating stats:', error);
    // En cas d'erreur, retourner des stats par défaut mais log l'erreur
    return {
      totalFunded: 0,
      totalDeposits: 0,
      totalReturns: 0,
      portfolioValue: 0,
      activeProjects: 0,
      totalContributions: 0,
      pendingReturns: 0,
      successRate: 0,
    };
  }
}