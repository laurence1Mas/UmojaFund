import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { verifyToken } from '@/lib/utils/jwt'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }
    
    await connectDB()
    
    // Récupérer l'utilisateur avec les champs nécessaires
    const user = await User.findById(decoded.userId).lean()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
    // Transformer l'objet user pour retourner les bonnes propriétés
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
      user: userResponse
    })
    
  } catch (error: any) {
    console.error('Error in auth/me:', error)
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