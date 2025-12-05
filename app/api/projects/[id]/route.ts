import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';

// Note: Les params doivent être déstructurés correctement
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Détails d'un projet
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    
    // Attendre les params (Next.js 14+)
    const { id } = await context.params;
    
    const project = await Project.findById(id)
      .populate('owner', 'name email');
    
    if (!project) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Projet non trouvé' 
        },
        { status: 404 }
      );
    }
    
    // Seuls les projets publiés sont visibles par défaut
    const isAuthenticated = request.headers.get('authorization');
    if (project.status !== 'published' && !isAuthenticated) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Projet non disponible' 
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: project,
    });

  } catch (error: any) {
    console.error('Get project error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération du projet' 
      },
      { status: 500 }
    );
  }
}

// PATCH: Mettre à jour un projet
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // TODO: Ajouter vérification d'authentification
    // Pour l'instant, accepter sans auth pour les tests
    
    const body = await request.json();
    const updates: any = {};
    
    // Champs autorisés
    const allowedUpdates = ['title', 'description', 'goalADA', 'deadline'];
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });
    
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
    
    // Validation de la date limite
    if (updates.deadline) {
      const deadlineDate = new Date(updates.deadline);
      if (deadlineDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'La date limite doit être dans le futur' },
          { status: 400 }
        );
      }
      updates.deadline = deadlineDate;
    }
    
    Object.assign(project, updates);
    await project.save();
    
    await project.populate('owner', 'name email');
    
    return NextResponse.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: project,
    });

  } catch (error: any) {
    console.error('Update project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false,
          error: errors.join(', ') 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la mise à jour du projet' 
      },
      { status: 500 }
    );
  }
}