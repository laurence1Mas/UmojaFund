import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { Contribution } from '@/lib/models/Contribution';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // Vérifier l'authentification
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    
    const body = await request.json();
    const { amountADA } = body;
    
    if (!amountADA || amountADA < 1) {
      return NextResponse.json(
        { success: false, error: 'Le montant minimum est 1 ADA' },
        { status: 400 }
      );
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Projet non trouvé' 
        },
        { status: 404 }
      );
    }
    
    if (project.status !== 'active') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ce projet n\'est pas encore publié' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si la campagne n'est pas terminée
    if (project.endDate < new Date()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'La campagne de financement est terminée' 
        },
        { status: 400 }
      );
    }
    
    // Créer une contribution en attente
    const contribution = new Contribution({
      project: project._id,
      user: payload.userId,
      amountADA,
      txHash: `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
    });
    
    await contribution.save();
    
    // Simuler une confirmation après 2 secondes (pour le dev)
    setTimeout(async () => {
      try {
        contribution.status = 'confirmed';
        await contribution.save();
        
        // Mettre à jour le montant collecté
        project.fundedAmount = (project.fundedAmount || 0) + amountADA;
        await project.save();
        
        console.log(`✅ Contribution ${contribution._id} confirmée pour le projet ${project._id}`);
      } catch (error) {
        console.error('Erreur confirmation automatique:', error);
      }
    }, 2000);
    
    return NextResponse.json({
      success: true,
      message: 'Contribution initiée. La confirmation sera traitée automatiquement.',
      data: {
        contributionId: contribution._id,
        amountADA,
        status: 'pending',
        txHash: contribution.txHash,
      },
    });

  } catch (error: any) {
    console.error('Contribute error:', error);
    
    if (error.message === 'Token invalide ou expiré') {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la contribution' 
      },
      { status: 500 }
    );
  }
}