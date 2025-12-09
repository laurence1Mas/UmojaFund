import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { Project } from '@/lib/models/Project';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    const userId = payload.userId;

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Calculer les statistiques en temps réel
    const stats = await calculateUserStats(userId);

    // Mettre à jour les stats en cache si nécessaire
    const shouldUpdateCache = !user.stats?.lastUpdated || 
      Date.now() - new Date(user.stats.lastUpdated).getTime() > 5 * 60 * 1000; // 5 minutes

    if (shouldUpdateCache) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          stats: {
            ...stats,
            lastUpdated: new Date(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error: any) {
    console.error('Get user stats error:', error);
    
    if (error.message === 'Token invalide ou expiré') {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

async function calculateUserStats(userId: string) {
  // Transactions
  const transactions = await Transaction.find({ userId }).lean();
  
  // Calculer le total investi (investments)
  const totalInvested = transactions
    .filter(t => t.type === 'investment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculer les retours (dividends + refunds)
  const totalReturns = transactions
    .filter(t => (t.type === 'dividend' || t.type === 'refund') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculer les dépôts totaux
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculer les retraits totaux
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Projets actifs de l'utilisateur
  const userProjects = await Project.find({
    'investors.userId': userId,
    status: 'active',
  }).lean();
  
  // Projets où l'utilisateur a investi
  const investedProjects = await Project.find({
    'investors.userId': userId,
    status: { $in: ['active', 'completed'] },
  }).lean();
  
  // Calculer la valeur du portefeuille (investissements actifs)
  const portfolioValue = investedProjects.reduce((sum, project) => {
    const userInvestment = project.investors.find(
      (inv: any) => inv.userId.toString() === userId
    );
    return sum + (userInvestment?.amount || 0);
  }, 0);
  
  // Retours en attente (dividends pending)
  const pendingReturns = transactions
    .filter(t => t.type === 'dividend' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Nombre de contributions
  const totalContributions = transactions.filter(t => 
    t.type === 'investment' && t.status === 'completed'
  ).length;

  return {
    totalFunded: totalInvested,
    totalDeposits,
    totalWithdrawals,
    totalReturns,
    portfolioValue: portfolioValue + totalReturns,
    pendingReturns,
    activeProjects: userProjects.length,
    totalContributions,
    successRate: investedProjects.length > 0 
      ? (investedProjects.filter(p => p.status === 'completed').length / investedProjects.length * 100).toFixed(1)
      : '0.0',
    lastUpdated: new Date(),
  };
}