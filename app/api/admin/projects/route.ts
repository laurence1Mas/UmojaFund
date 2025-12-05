import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';

// GET: Liste tous les projets (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    
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
    console.error('Admin get projects error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des projets' 
      },
      { status: 500 }
    );
  }
}