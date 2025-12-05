import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    console.log(`✅ Approbation du projet: ${id}`);
    
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
    
    console.log(`📋 Projet trouvé: ${project.title}, status: ${project.status}`);
    
    // Passer de draft/pending à published
    if (project.status !== 'draft' && project.status !== 'pending') {
      return NextResponse.json(
        { 
          success: false,
          error: `Le projet est déjà en statut: ${project.status}` 
        },
        { status: 400 }
      );
    }
    
    // S'assurer que les champs requis ont des valeurs par défaut
    if (!project.imageUrl) {
      project.imageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop';
    }
    
    if (!project.pdfUrl) {
      project.pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }
    
    project.status = 'published';
    
    console.log(`💾 Sauvegarde du projet...`);
    await project.save();
    
    console.log(`✅ Projet sauvegardé avec succès`);
    
    await project.populate('owner', 'name email');
    
    return NextResponse.json({
      success: true,
      message: 'Projet approuvé et publié avec succès',
      data: {
        id: project._id,
        title: project.title,
        status: project.status,
        imageUrl: project.imageUrl,
        pdfUrl: project.pdfUrl,
        updatedAt: project.updatedAt,
      },
    });

  } catch (error: any) {
    console.error('❌ Approve project error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      console.error('Validation errors:', errors);
      
      return NextResponse.json(
        { 
          success: false,
          error: `Erreur de validation: ${errors.join(', ')}`,
          details: errors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'approbation du projet',
        details: error.message
      },
      { status: 500 }
    );
  }
}