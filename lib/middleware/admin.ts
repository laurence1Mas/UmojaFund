import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './auth';

export function adminMiddleware(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès refusé. Droits administrateur requis.' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}