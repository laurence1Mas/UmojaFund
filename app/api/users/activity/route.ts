import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
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
    
    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Récupérer les transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Récupérer les mises à jour de projets
    const userProjects = await Project.find({
      'investors.userId': userId,
      'updates.0': { $exists: true },
    })
      .select('title updates')
      .lean();

    // Combiner et formater les activités
    const activities = [
      ...transactions.map(txn => ({
        id: txn._id.toString(),
        type: 'transaction',
        date: txn.createdAt,
        action: getTransactionAction(txn.type),
        description: txn.description,
        amount: txn.amount,
        currency: txn.currency,
        status: txn.status,
        metadata: {
          projectId: txn.projectId?.toString(),
          projectTitle: txn.projectTitle,
        },
      })),
      ...userProjects.flatMap(project => 
        project.updates.map((update: any) => ({
          id: `${project._id.toString()}-${update.date.getTime()}`,
          type: 'project_update',
          date: update.date,
          action: 'Project Update',
          description: update.title,
          content: update.content,
          metadata: {
            projectId: project._id.toString(),
            projectTitle: project.title,
          },
        }))
      ),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, limit); // Limiter le nombre total

    // Compter le total
    const totalTransactions = await Transaction.countDocuments({ userId });
    const totalProjectUpdates = userProjects.reduce(
      (sum, project) => sum + (project.updates?.length || 0), 
      0
    );
    const total = totalTransactions + totalProjectUpdates;

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error: any) {
    console.error('Get user activity error:', error);
    
    if (error.message === 'Token invalide ou expiré') {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des activités' },
      { status: 500 }
    );
  }
}

function getTransactionAction(type: string): string {
  const actions: Record<string, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    investment: 'Investment',
    refund: 'Refund',
    dividend: 'Dividend Received',
    fee: 'Fee Charged',
  };
  return actions[type] || 'Transaction';
}