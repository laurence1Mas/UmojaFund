import { NextRequest } from 'next/server';
import { User } from '@/lib/models/User';
import { verifyToken, extractTokenFromHeader } from './jwt'; // Importez ces fonctions

export async function getAuthUser(request: NextRequest) {
  try {
    // 1. Extraire le token du header Authorization (comme /api/auth/me)
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    
    if (!token) {
      throw new Error('Informations d\'authentification manquantes');
    }

    // 2. Vérifier le token
    const payload = verifyToken(token);
    
    // 3. Optionnel: Récupérer l'utilisateur depuis la DB
    const user = await User.findById(payload.userId).select('-passwordHash');
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return { 
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      user // Optionnel: l'objet utilisateur complet
    };
    
  } catch (error) {
    console.error('Auth error:', error.message);
    throw new Error('Informations d\'authentification manquantes');
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const { user } = await getAuthUser(request);
  return user;
}


export function validateRequest(body: any, requiredFields: string[]) {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!body[field] && body[field] !== 0) {
      errors.push(`Le champ ${field} est requis`);
    }
  });
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
}

export function formatResponse(data: any, message?: string, status: number = 200) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function formatError(error: any, status: number = 400) {
  return {
    success: false,
    error: error.message || 'Une erreur est survenue',
    timestamp: new Date().toISOString(),
  };
}