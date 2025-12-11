import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contribution } from '@/lib/models/Contribution';
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }
    const payload = verifyToken(token);
    const { id } = await context.params;

    const contribution = await Contribution.findById(id)
      .populate('project', 'title creatorName expectedROI endDate')
      .lean();

    if (!contribution || contribution.user.toString() !== payload.userId) {
      return NextResponse.json({ success: false, error: 'Contribution non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        contributionId: contribution._id.toString(),
        amountADA: contribution.amountADA,
        status: contribution.status,
        txHash: contribution.txHash,
        createdAt: contribution.createdAt,
        project: {
          id: contribution.project._id.toString(),
          title: contribution.project.title,
          creatorName: contribution.project.creatorName,
          expectedROI: contribution.project.expectedROI,
          endDate: contribution.project.endDate
        }
      }
    });

  } catch (error: any) {
    console.error('Erreur GET contribution:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}