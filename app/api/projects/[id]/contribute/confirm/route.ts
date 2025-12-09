import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { Contribution } from '@/lib/models/Contribution';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    const body = await request.json();
    const { txHash, checkoutId, amountADA } = body;
    
    if (!txHash || !checkoutId || !amountADA) {
      return NextResponse.json(
        { success: false, error: 'txHash, checkoutId et amountADA sont requis' },
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
    
    // Vérifier si la transaction existe déjà
    const existingContribution = await Contribution.findOne({ txHash });
    if (existingContribution) {
      return NextResponse.json(
        { success: false, error: 'Cette transaction a déjà été enregistrée' },
        { status: 409 }
      );
    }
    
    // Créer la contribution confirmée
    const contribution = new Contribution({
      project: project._id,
      amountADA,
      txHash,
      status: 'confirmed',
    });
    
    await contribution.save();
    
    // Mettre à jour le montant collecté
    project.raisedADA = (project.raisedADA || 0) + amountADA;
    await project.save();
    
    return NextResponse.json({
      success: true,
      message: 'Contribution confirmée avec succès',
      data: {
        contributionId: contribution._id,
        amountADA,
        projectRaised: project.raisedADA,
        projectGoal: project.goalADA,
      },
    });

  } catch (error: any) {
    console.error('Confirm contribution error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la confirmation de la contribution' 
      },
      { status: 500 }
    );
  }
}