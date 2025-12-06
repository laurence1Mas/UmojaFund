import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { getAuthUser, formatResponse, formatError } from '@/lib/utils/apiHelpers';
import { authMiddleware } from '@/lib/middleware/auth';

// Appliquer le middleware
export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}


export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getAuthUser(request);
    
    // Récupérer les paramètres
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const skip = (page - 1) * limit;

    // Construire la requête
    const query: any = {
      'investors.userId': userId,
    };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    // Récupérer les projets
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Formater les projets
    const formattedProjects = projects.map(project => {
      const userInvestment = project.investors.find(
        (inv: any) => inv.userId && inv.userId.toString() === userId
      );
      
      // Calculer le ROI
      const totalInvested = project.investors?.reduce(
        (sum: number, inv: any) => sum + (inv.amount || 0), 0
      ) || 0;
      
      const userROI = userInvestment?.returns 
        ? ((userInvestment.returns / (userInvestment.amount || 1)) * 100).toFixed(1)
        : '0.0';
      
      // Calculer le progrès
      const progress = project.fundingGoal > 0 
        ? (project.fundedAmount / project.fundingGoal) * 100 
        : 0;
      
      // Jours restants
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
// Avant de faire l'appel à /api/projects/user, récupérez d'abord le user
const fetchUserProjects = async () => {
  try {
    // 1. Récupérer l'utilisateur depuis /api/auth/me
    const userResponse = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (!userResponse.ok) throw new Error('Non authentifié');
    
    const userData = await userResponse.json();
    const user = userData.user;
    
    // 2. Appeler /api/projects/user avec les headers x-
    const projectsResponse = await fetch('/api/projects/user?limit=3&status=active', {
      headers: {
        'x-user-id': user.id,
        'x-user-role': user.role,
        'x-user-email': user.email,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    return await projectsResponse.json();
  } catch (error) {
    console.error('Error:', error);
  }
};
      return {
        id: project._id.toString(),
        title: project.title,
        description: project.shortDescription || project.description.substring(0, 200) + '...',
        category: project.category,
        status: project.status,
        image: project.images?.[0] || null,
        
        // Funding info
        fundingGoal: project.fundingGoal,
        fundedAmount: project.fundedAmount,
        progress: Math.min(100, progress),
        backersCount: project.backersCount || 0,
        daysLeft,
        
        // User investment
        userInvestment: {
          amount: userInvestment?.amount || 0,
          date: userInvestment?.date || project.createdAt,
          returns: userInvestment?.returns || 0,
          roi: `${userROI}%`,
        },
        
        // Project details
        creatorName: project.creatorName,
        startDate: project.startDate,
        endDate: project.endDate,
        expectedROI: project.expectedROI,
        minInvestment: project.minInvestment,
        milestones: project.milestones?.length || 0,
        verified: project.verified || false,
        featured: project.featured || false,
        
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });

    // Compter le total
    const total = await Project.countDocuments(query);

    return NextResponse.json(formatResponse({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalInvested: formattedProjects.reduce((sum, p) => sum + p.userInvestment.amount, 0),
        totalReturns: formattedProjects.reduce((sum, p) => sum + p.userInvestment.returns, 0),
        activeProjects: formattedProjects.filter(p => p.status === 'active').length,
        completedProjects: formattedProjects.filter(p => p.status === 'completed').length,
      },
    }));

  } catch (error: any) {
    console.error('Get user projects error:', error);
    
    // Gérer le cas où la collection n'existe pas encore
    if (error.message.includes('collection') || error.message.includes('not found')) {
      return NextResponse.json(formatResponse({
        projects: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        summary: {
          totalInvested: 0,
          totalReturns: 0,
          activeProjects: 0,
          completedProjects: 0,
        },
      }));
    }
    
    return NextResponse.json(
      formatError(error),
      { status: 500 }
    );
  }
}