import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function authMiddleware(request: NextRequest) {
  try {
    await connectDB();
    
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    
    const user = await User.findById(payload.userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Ajouter l'utilisateur à la requête
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user._id.toString());
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-email', user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur d\'authentification' },
      { status: 500 }
    );
  }
}

export function getAuthUser(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id'),
    role: request.headers.get('x-user-role'),
    email: request.headers.get('x-user-email'),
  };
}