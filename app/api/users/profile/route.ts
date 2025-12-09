import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser, formatResponse, formatError } from '@/lib/utils/apiHelpers';
import { authMiddleware } from '@/lib/middleware/auth';

// Appliquer le middleware à toutes les méthodes
export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getAuthUser(request);
    
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        formatError(new Error('Utilisateur non trouvé')),
        { status: 404 }
      );
    }

    return NextResponse.json(formatResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        website: user.website,
        avatar: user.avatar,
        walletAddress: user.walletAddress,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }));

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      formatError(error),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getAuthUser(request);
    const body = await request.json();
    
    // Champs autorisés pour mise à jour
    const allowedFields = [
      'name', 'phone', 'bio', 'location', 'website', 'avatar',
      'preferences.language', 'preferences.currency', 'preferences.timezone',
      'preferences.theme', 'preferences.dateFormat', 'preferences.notifications'
    ];
    
    // Construire l'objet de mise à jour
    const updateData: any = {};
    
    // Traiter les champs simples
    const simpleFields = allowedFields.filter(f => !f.includes('.'));
    simpleFields.forEach(field => {
      if (field in body) {
        updateData[field] = body[field];
      }
    });
    
    // Traiter les préférences
    if (body.preferences) {
      updateData.preferences = body.preferences;
    }
    
    // Vérifier l'email unique si fourni
    if (body.email) {
      const existingUser = await User.findOne({ 
        email: body.email.toLowerCase().trim(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json(
          formatError(new Error('Cet email est déjà utilisé')),
          { status: 409 }
        );
      }
      updateData.email = body.email.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        formatError(new Error('Utilisateur non trouvé')),
        { status: 404 }
      );
    }

    return NextResponse.json(
      formatResponse(
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bio: user.bio,
            location: user.location,
            website: user.website,
            avatar: user.avatar,
            walletAddress: user.walletAddress,
            role: user.role,
            preferences: user.preferences,
            stats: user.stats,
            twoFactorEnabled: user.twoFactorEnabled,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        'Profil mis à jour avec succès'
      )
    );

  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        formatError(new Error(errors.join(', '))),
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      formatError(error),
      { status: 500 }
    );
  }
}