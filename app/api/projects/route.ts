import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';

// GET: Liste des projets
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    const filter: any = { status };
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);
    
    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error('Get projects error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des projets' 
      },
      { status: 500 }
    );
  }
}

// POST: Créer un projet (JSON seulement)
export async function POST(request: NextRequest) {
  console.log('🚀 Create project endpoint called');
  
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    
    // Parser le body
    const body = await request.json();
    console.log('📦 Body received:', body);
    
    const { title, description, goalADA, deadline } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le titre est requis' },
        { status: 400 }
      );
    }
    
    if (!description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'La description est requise' },
        { status: 400 }
      );
    }
    
    if (!goalADA || goalADA < 10) {
      return NextResponse.json(
        { success: false, error: 'Le objectif minimum est 10 ADA' },
        { status: 400 }
      );
    }
    
    if (!deadline) {
      return NextResponse.json(
        { success: false, error: 'La date limite est requise' },
        { status: 400 }
      );
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'La date limite doit être dans le futur' },
        { status: 400 }
      );
    }

    // Créer le projet avec valeurs par défaut
    const project = new Project({
      title: title.trim(),
      description: description.trim(),
      goalADA,
      deadline: deadlineDate,
      owner: payload.userId, // Utiliser l'ID du token
      status: 'draft',
      // imageUrl et pdfUrl auront les valeurs par défaut du modèle
    });

    console.log('💾 Saving project...');
    await project.save();
    
    await project.populate('owner', 'name email');

    console.log('✅ Project saved:', project._id);
    
    return NextResponse.json({
      success: true,
      message: 'Projet créé avec succès',
      data: project,
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Create project error:', error);
    
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
    
    if (error.message === 'Token invalide ou expiré') {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la création du projet' 
      },
      { status: 500 }
    );
  }
}