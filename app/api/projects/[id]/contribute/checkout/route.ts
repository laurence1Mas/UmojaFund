import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
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
    
    // Récupérer l'adresse Cardano du porteur de projet
    let paymentAddress: string;
    let isSimulated = false;
    
    // Récupérer le propriétaire du projet
    const owner = await User.findById(project.owner);
    
    if (owner) {
      // Chercher un wallet Cardano pour le porteur de projet
      const ownerWallet = await Wallet.findOne({
        userId: owner._id.toString(),
        type: 'cardano',
      });
      
      if (ownerWallet && ownerWallet.address) {
        // Utiliser l'adresse réelle du porteur de projet
        paymentAddress = ownerWallet.address;
        isSimulated = false;
      } else if (owner.walletAddress) {
        // Utiliser l'adresse du wallet dans le profil utilisateur
        paymentAddress = owner.walletAddress;
        isSimulated = false;
      } else {
        // Pas d'adresse trouvée, utiliser une adresse mock (mode simulation)
        paymentAddress = CardanoSimulator.generateMockAddress();
        isSimulated = true;
      }
    } else {
      // Propriétaire non trouvé, utiliser une adresse mock
      paymentAddress = CardanoSimulator.generateMockAddress();
      isSimulated = true;
    }
    
    // Générer le checkout
    const checkoutData = {
      paymentAddress,
      amountADA,
      projectId: project._id.toString(),
      projectTitle: project.title,
      checkoutId: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      qrCodeUrl: CardanoSimulator.generateQRCode(amountADA, project._id.toString()),
      isSimulated,
      simulationNote: isSimulated 
        ? 'Mode simulation - Le porteur de projet n\'a pas configuré d\'adresse Cardano. Veuillez utiliser le mode manuel ou demander au porteur de projet de configurer son wallet.'
        : 'Adresse du porteur de projet - Transaction réelle sur la blockchain Cardano'
    };

    // Démarrer la simulation de confirmation uniquement si c'est une adresse mock
    if (isSimulated) {
      CardanoSimulator.simulateWebhook(project._id.toString(), amountADA);
    }

    return NextResponse.json({
      success: true,
      message: isSimulated 
        ? 'Checkout généré (mode simulation - adresse mock)' 
        : 'Checkout généré avec l\'adresse du porteur de projet',
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