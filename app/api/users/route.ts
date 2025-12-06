import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';
import { Project } from '@/lib/models/Project';
import { getAuthUser, formatResponse, formatError } from '@/lib/utils/apiHelpers';
import { authMiddleware } from '@/lib/middleware/auth';

// Appliquer le middleware
export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getAuthUser(request);

    // Utiliser les stats en cache ou les calculer
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        formatError(new Error('Utilisateur non trouvé')),
        { status: 404 }
      );
    }

    // Vérifier si les stats sont fraîches (moins de 5 minutes)
    const shouldUpdateStats = !user.stats?.lastUpdated || 
      Date.now() - new Date(user.stats.lastUpdated).getTime() > 5 * 60 * 1000;

    let stats = user.stats || {};

    if (shouldUpdateStats) {
      stats = await calculateUserStats(userId);
      
      // Mettre à jour le cache
      await User.findByIdAndUpdate(userId, {
        $set: {
          stats: {
            ...stats,
            lastUpdated: new Date(),
          },
        },
      });
    }

    return NextResponse.json(formatResponse({ stats }));

  } catch (error: any) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      formatError(error),
      { status: 500 }
    );
  }
}

async function calculateUserStats(userId: string) {
  const [transactions, activeProjects, allProjects] = await Promise.all([
    Transaction.find({ userId, status: 'completed' }).lean(),
    Project.find({ 
      'investors.userId': userId,
      status: 'active' 
    }).lean(),
    Project.find({ 
      'investors.userId': userId,
      status: { $in: ['active', 'completed'] }
    }).lean(),
  ]);

  // Calculs
  const totalInvested = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReturns = transactions
    .filter(t => t.type === 'dividend' || t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  // CORRECTION ICI : Gérer les cas où investors est undefined
  const portfolioValue = allProjects.reduce((sum, project) => {
    // Vérifier si investors existe et est un tableau
    const investors = project.investors || [];
    
    // Trouver l'investissement utilisateur avec vérifications
    const userInvestment = investors.find((inv) => {
      if (!inv || !inv.userId) return false;
      
      // Comparer les IDs en string
      const invUserId = inv.userId.toString ? inv.userId.toString() : String(inv.userId);
      const targetUserId = userId.toString ? userId.toString() : String(userId);
      
      return invUserId === targetUserId;
    });
    
    return sum + (userInvestment?.amount || 0);
  }, 0);

  // Calculer le taux de succès
  const completedProjects = allProjects.filter(p => p.status === 'completed').length;
  const successRate = allProjects.length > 0 
    ? parseFloat(((completedProjects / allProjects.length) * 100).toFixed(1))
    : 0;

  return {
    totalFunded: totalInvested,
    totalDeposits,
    totalReturns,
    portfolioValue: portfolioValue + totalReturns,
    activeProjects: activeProjects.length,
    totalContributions: transactions.filter(t => t.type === 'investment').length,
    successRate,
    lastUpdated: new Date(),
  };
}