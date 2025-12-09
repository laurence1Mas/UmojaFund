import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { generateToken } from '@/lib/utils/jwt'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    await connectDB()

    // Chercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects' },
        { status: 401 }
      )
    }

    // Vérifier si le compte est verrouillé
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Compte temporairement verrouillé. Veuillez réessayer plus tard.' 
        },
        { status: 403 }
      )
    }

    // Réinitialiser les tentatives de connexion échouées
    user.failedLoginAttempts = 0
    user.accountLockedUntil = undefined
    await user.save()

    // Générer le token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    // Préparer la réponse utilisateur
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      
      // Profile fields
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
      
      // Preferences
      preferences: user.preferences,
      
      // Statistics
      stats: user.stats,
      
      // Security
      twoFactorEnabled: user.twoFactorEnabled,
      
      // Dates
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastPasswordChange: user.lastPasswordChange
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userResponse
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}