import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { authMiddleware, getAuthUser } from '@/lib/middleware/auth';

interface RouteParams {
  params: { id: string };
}

// GET: Détails d'un projet
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    const project = await Project.findById(params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'contributions',
        select: 'amountADA status date',
        options: { sort: { date: -1 }, limit: 10 },
      });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Seuls les projets publiés sont visibles par les non-authentifiés
    const isAuthenticated = request.headers.get('authorization');
    const { role } = getAuthUser(request);
    
    if (project.status !== 'published' && (!isAuthenticated || (role !== 'admin' && project.owner._id.toString() !== getAuthUser(request).userId))) {
      return NextResponse.json(
        { error: 'Projet non disponible' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ project });

  } catch (error: any) {
    console.error('Get project error:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH: Mettre à jour un projet
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérifier l'authentification
    const authResponse = await authMiddleware(request);
    if (authResponse.status !== 200) {
      return authResponse;
    }

    await connectDB();
    
    const { userId, role } = getAuthUser(request);
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier les permissions
    const isOwner = project.owner.toString() === userId;
    const isAdmin = role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Permission refusée' },
        { status: 403 }
      );
    }
    
    // Seul le propriétaire peut modifier un projet publié
    if (project.status === 'published' && !isAdmin) {
      return NextResponse.json(
        { error: 'Impossible de modifier un projet publié' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const updates: any = {};
    
    // Champs autorisés pour mise à jour
    const allowedUpdates = ['title', 'description', 'goalADA', 'deadline'];
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });
    
    // Validation de la date limite
    if (updates.deadline) {
      const deadlineDate = new Date(updates.deadline);
      if (deadlineDate <= new Date()) {
        return NextResponse.json(
          { error: 'La date limite doit être dans le futur' },
          { status: 400 }
        );
      }
      updates.deadline = deadlineDate;
    }
    
    Object.assign(project, updates);
    await project.save();
    
    await project.populate('owner', 'name email');
    
    return NextResponse.json({
      message: 'Projet mis à jour avec succès',
      project,
    });

  } catch (error: any) {
    console.error('Update project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}