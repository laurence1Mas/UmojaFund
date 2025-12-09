import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { generateToken } from '@/lib/utils/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  console.log('🔵 Register endpoint called');
  
  try {
    await connectDB();
    console.log('✅ DB connected');
    
    const body = await request.json();
    console.log('📦 Request body received');
    
    const { name, email, password, walletAddress } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le nom est requis' },
        { status: 400 }
      );
    }
    
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'L\'email est requis' },
        { status: 400 }
      );
    }
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe est requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un compte avec cet email existe déjà'
        },
        { status: 409 }
      );
    }

    console.log('👤 Hashing password...');
    
    // Hacher le mot de passe MANUELLEMENT (sans middleware)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log('👤 Creating user...');
    
    // Créer l'utilisateur avec le mot de passe déjà hashé
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: passwordHash,
      walletAddress: walletAddress?.trim(),
    });

    console.log('👤 Saving user...');
    await user.save();
    console.log('✅ User saved:', user._id.toString());

    // Générer le token JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    console.log('✅ Token generated');
    
    const response = {
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    };
    
    console.log('📤 Sending response');
    
    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('❌ Register error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      console.log('Validation errors:', errors);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errors.join(', ')
        },
        { status: 400 }
      );
    }
    
    // Erreur de clé dupliquée (email unique)
    if (error.code === 11000) {
      console.log('Duplicate key error');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un compte avec cet email existe déjà'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la création du compte'
      },
      { status: 500 }
    );
  }
}