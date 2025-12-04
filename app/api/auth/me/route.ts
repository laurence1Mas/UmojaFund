import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { authMiddleware, getAuthUser } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // Appliquer le middleware d'authentification
    const authResponse = await authMiddleware(request);
    if (authResponse.status !== 200) {
      return authResponse;
    }

    await connectDB();
    
    const { userId } = getAuthUser(request);
    
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    });

  } catch (error: any) {
    console.error('Get me error:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}