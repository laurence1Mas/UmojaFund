import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contribution } from '@/lib/models/Contribution';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }
    const payload = verifyToken(token);

    const contributions = await Contribution.find({ user: payload.userId })
      .populate('project', 'title creatorName expectedROI endDate')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: contributions });

  } catch (error: any) {
    console.error('Erreur GET contributions/me:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}