import jwt from  'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'superSecretUmojaKey';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' ? token : null;
}