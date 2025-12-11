// app/api/users/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contribution } from '@/lib/models/Contribution';
import { verifyToken } from '@/lib/utils/jwt';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 GET /api/users/activity called');
    
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
    
    // 2. Connexion à la base de données
    await connectDB();
    
    // 3. Récupérer les paramètres
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // 4. Récupérer les contributions
    const contributions = await Contribution.find({ 
      user: userObjectId 
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('project', 'title')
    .lean();
    
    console.log(`📋 Found ${contributions.length} contributions for user ${userId}`);
    
    // 5. Formater les activités
    const activities = contributions.map(contribution => ({
      id: contribution._id.toString(),
      type: 'contribution',
      date: contribution.createdAt?.toISOString() || new Date().toISOString(),
      action: 'Contribution',
      description: `Contribution au projet: ${contribution.project?.title || 'Projet'}`,
      amount: contribution.amountADA || 0,
      currency: 'ADA',
      status: contribution.status || 'confirmed',
      metadata: {
        projectId: contribution.project?._id?.toString(),
        projectTitle: contribution.project?.title || 'Projet non spécifié',
        txHash: contribution.txHash
      },
    }));
    
    // 6. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: 1,
          limit,
          total: await Contribution.countDocuments({ user: userObjectId }),
          totalPages: 1,
        },
      },
    });
    
  } catch (error: any) {
    console.error('❌ Error in /api/users/activity:', error);
    
    // Retourner une réponse vide plutôt qu'une erreur
    return NextResponse.json({
      success: true,
      data: {
        activities: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 0,
        },
      },
    });
  }
}