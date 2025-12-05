import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Extraire le token du header
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const payload = verifyToken(token);
    
    // Trouver l'utilisateur
    const user = await User.findById(payload.userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
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
    console.error('Get user profile error:', error);
    
    if (error.message === 'Token invalide ou expiré') {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}