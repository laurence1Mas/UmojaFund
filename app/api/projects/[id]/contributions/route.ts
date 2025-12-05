import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contribution } from '@/lib/models/Contribution';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    
    const filter: any = { project: id };
    if (status) {
      filter.status = status;
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const [contributions, total] = await Promise.all([
      Contribution.find(filter)
        .populate('user', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Contribution.countDocuments(filter),
    ]);
    
    return NextResponse.json({
      success: true,
      data: contributions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error('Get contributions error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des contributions' 
      },
      { status: 500 }
    );
  }
}