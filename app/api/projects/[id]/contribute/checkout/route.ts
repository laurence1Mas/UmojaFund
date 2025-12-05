import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';
import { CardanoSimulator } from '@/lib/services/cardano/simulator';
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
    
    if (project.status !== 'published') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ce projet n\'est pas encore publié' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si la campagne n'est pas terminée
    if (project.deadline < new Date()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'La campagne de financement est terminée' 
        },
        { status: 400 }
      );
    }
    
    // Générer un checkout mock pour Cardano
    const checkoutData = {
  paymentAddress: CardanoSimulator.generateMockAddress(),
  amountADA,
  projectId: project._id,
  projectTitle: project.title,
  checkoutId: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  qrCodeUrl: CardanoSimulator.generateQRCode(amountADA, project._id.toString()),
  isSimulated: true,
  simulationNote: 'Mode développement - Transaction sera automatiquement confirmée'
};

// Démarrer la simulation de confirmation
CardanoSimulator.simulateWebhook(project._id.toString(), amountADA);

return NextResponse.json({
  success: true,
  message: 'Checkout généré (mode simulation Cardano)',
  data: checkoutData,
});

  } catch (error: any) {
    console.error('Checkout error:', error);
    
    if (error.message === 'Token invalide ou expiré') {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la génération du checkout' 
      },
      { status: 500 }
    );
  }
}