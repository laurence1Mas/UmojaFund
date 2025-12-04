import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { authMiddleware } from '@/lib/middleware/auth';
import { adminMiddleware } from '@/lib/middleware/admin';

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérifier l'authentification et les droits admin
    const authResponse = await authMiddleware(request);
    if (authResponse.status !== 200) {
      return authResponse;
    }
    
    const adminResponse = adminMiddleware(request);
    if (adminResponse.status !== 200) {
      return adminResponse;
    }

    await connectDB();
    
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    if (project.status !== 'pending') {
      return NextResponse.json(
        { error: 'Seuls les projets en attente peuvent être approuvés' },
        { status: 400 }
      );
    }
    
    // Approuver le projet
    project.status = 'published';
    await project.save();
    
    await project.populate('owner', 'name email');
    
    // Ici, tu pourrais ajouter la logique pour déployer le smart contract
    // project.smartContractAddress = await deploySmartContract(project);
    // await project.save();
    
    return NextResponse.json({
      message: 'Projet approuvé et publié avec succès',
      project,
    });

  } catch (error: any) {
    console.error('Approve project error:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}