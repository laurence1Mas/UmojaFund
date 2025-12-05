import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { Contribution } from '@/lib/models/Contribution';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('📨 Webhook Cardano reçu:', body);
    
    const { txHash, amountADA, status, projectId, metadata } = body;
    
    if (!txHash || !amountADA || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      );
    }
    
    // Vérifier si la transaction existe déjà
    const existingContribution = await Contribution.findOne({ txHash });
    if (existingContribution) {
      return NextResponse.json(
        { success: false, error: 'Transaction déjà traitée' },
        { status: 409 }
      );
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Créer ou mettre à jour la contribution
    let contribution = await Contribution.findOneAndUpdate(
      { txHash },
      {
        project: project._id,
        amountADA,
        txHash,
        status: status || 'confirmed',
        date: new Date(),
      },
      { upsert: true, new: true }
    );
    
    // Mettre à jour le montant collecté si confirmé
    if (status === 'confirmed') {
      project.raisedADA = (project.raisedADA || 0) + amountADA;
      await project.save();
      
      console.log(`💰 Projet ${project.title} : +${amountADA} ADA = ${project.raisedADA}/${project.goalADA}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transaction enregistrée',
      data: {
        contributionId: contribution._id,
        projectId: project._id,
        amountADA,
        newTotal: project.raisedADA,
        isSimulated: metadata?.simulated || false
      }
    });
    
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur traitement webhook',
        details: error.message
      },
      { status: 500 }
    );
  }
}