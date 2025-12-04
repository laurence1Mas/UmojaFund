import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { authMiddleware, getAuthUser } from '@/lib/middleware/auth';
import { uploadImage, uploadPDF } from '@/lib/services/uploadService';

// GET: Liste des projets
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Construire le filtre
    const filter: any = {};
    
    // Seuls les projets publiés sont visibles par défaut
    if (!status && !request.headers.get('authorization')) {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }
    
    // Recherche par titre ou description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);
    
    return NextResponse.json({
      projects,
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
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST: Créer un projet
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResponse = await authMiddleware(request);
    if (authResponse.status !== 200) {
      return authResponse;
    }

    await connectDB();
    
    const { userId } = getAuthUser(request);
    
    // Vérifier si l'utilisateur a déjà un projet actif
    const existingProject = await Project.findOne({
      owner: userId,
      status: { $in: ['pending', 'published', 'funded'] },
    });
    
    if (existingProject) {
      return NextResponse.json(
        { error: 'Vous avez déjà une campagne active. Une seule campagne autorisée à la fois.' },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const goalADA = parseFloat(formData.get('goalADA') as string);
    const deadline = formData.get('deadline') as string;
    const imageFile = formData.get('image') as File;
    const pdfFile = formData.get('pdf') as File;
    
    // Validation
    if (!title || !description || !goalADA || !deadline || !imageFile || !pdfFile) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    if (goalADA < 10) {
      return NextResponse.json(
        { error: 'Le objectif minimum est 10 ADA' },
        { status: 400 }
      );
    }
    
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { error: 'La date limite doit être dans le futur' },
        { status: 400 }
      );
    }
    
    // Upload des fichiers
    const [imageUrl, pdfUrl] = await Promise.all([
      uploadImage(imageFile),
      uploadPDF(pdfFile),
    ]);
    
    // Créer le projet
    const project = new Project({
      title,
      description,
      imageUrl,
      pdfUrl,
      goalADA,
      deadline: deadlineDate,
      owner: userId,
      status: 'pending', // Doit être approuvé par l'admin
    });
    
    await project.save();
    
    await project.populate('owner', 'name email');
    
    return NextResponse.json({
      message: 'Projet créé avec succès. En attente d\'approbation.',
      project,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create project error:', error);
    
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