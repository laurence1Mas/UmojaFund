import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    const { currentPassword, newPassword } = await request.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe actuel et le nouveau mot de passe sont requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit être différent de l\'ancien' },
        { status: 400 }
      );
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Mettre à jour l'utilisateur
    user.passwordHash = passwordHash;
    user.lastPasswordChange = new Date();
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    });

  } catch (error: any) {
    console.error('Update password error:', error);
    
    if (error.message === 'Token invalide ou expiré') {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du mot de passe' },
      { status: 500 }
    );
  }
}