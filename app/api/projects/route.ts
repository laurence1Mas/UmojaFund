import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';

// GET: Liste des projets
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
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
    console.log('📦 Body received:', JSON.stringify(body, null, 2));
    
    // Extraction de tous les champs nécessaires
    const { 
      title, 
      shortDescription, 
      description, 
      story,
      category,
      fundingGoal,
      minInvestment,
      expectedROI,
      startDate,
      endDate,
      duration,
      deadline,
      imageUrl,
      pdfUrl,
      location,
      beneficiaries,
      jobsCreated,
      team,
      risks,
      timeline,
      tags,
      socialMedia
    } = body;

    console.log('📊 Debug - category:', category);
    console.log('📊 Debug - shortDescription length:', shortDescription?.length);

    // Validation des champs obligatoires
    const requiredFields = [
      'title', 'shortDescription', 'description', 'story', 'category',
      'fundingGoal', 'minInvestment', 'expectedROI', 'startDate', 'endDate',
      'duration'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Champs manquants : ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    if (fundingGoal < 10) {
      return NextResponse.json(
        { success: false, error: 'L\'objectif minimum est 10 ADA' },
        { status: 400 }
      );
    }
    
    if (minInvestment < 10) {
      return NextResponse.json(
        { success: false, error: 'L\'investissement minimum est 10 ADA' },
        { status: 400 }
      );
    }

    // Valider shortDescription length
    if (shortDescription && shortDescription.length > 200) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La description courte ne doit pas dépasser 200 caractères' 
        },
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

    // Convertir la catégorie française en anglais si nécessaire
    const categoryMap: {[key: string]: string} = {
      'éducation': 'education',
      'education': 'education',
      'environnement': 'environment',
      'technologie': 'technology',
      'santé': 'health',
      'agriculture': 'agriculture',
      'énergie': 'energy',
      'communauté': 'community',
      'arts': 'arts',
      'autre': 'other'
    };

    const validCategory = categoryMap[category.toLowerCase()] || 'other';
    
    // Convertir risks en string si c'est un tableau
    let risksString = '';
    if (Array.isArray(risks)) {
      risksString = risks.map(risk => 
        `${risk.description || risk}: ${risk.mitigation || ''}`
      ).join('; ');
    } else if (typeof risks === 'string') {
      risksString = risks;
    }

    // Créer le projet avec tous les champs
    const project = new Project({
      title: title.trim(),
      shortDescription: shortDescription.substring(0, 200).trim(), // Limiter à 200 caractères
      description: description.trim(),
      story: story.trim(),
      category: validCategory,
      creatorId: body.creatorId || payload.userId, // Prendre du body ou du token
      creatorName: body.creatorName || 'Unknown',
      fundingGoal,
      goalADA: fundingGoal, // Pour compatibilité
      minInvestment,
      expectedROI,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration,
      deadline: deadlineDate,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
      pdfUrl: pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      location: location || '',
      beneficiaries: beneficiaries || 0,
      jobsCreated: jobsCreated || 0,
      owner: payload.userId,
      status: 'draft',
      raisedADA: 0,
      backersCount: 0,
      fundedAmount: 0,
      currency: 'ADA',
      images: [],
      tags: tags || [],
      featured: false,
      verified: false,
      team: team || [],
      risks: risksString, // Convertir en string
      timeline: timeline || [],
      socialMedia: socialMedia || {},
      updates: [],
      investors: [],
      milestones: []
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
        error: error.message || 'Erreur lors de la création du projet' 
      },
      { status: 500 }
    );
  }
}