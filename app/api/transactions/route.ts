import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/lib/models/Transaction';
import { getAuthUser, formatResponse, formatError, validateRequest } from '@/lib/utils/apiHelpers';
import { authMiddleware } from '@/lib/middleware/auth';

// Appliquer le middleware
export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getAuthUser(request);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    // Statistiques résumées
    const stats = await Transaction.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json(formatResponse({
      transactions: transactions.map(txn => ({
        id: txn._id.toString(),
        ...txn,
        _id: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, stat) => ({
        ...acc,
        [stat._id]: {
          totalAmount: stat.totalAmount,
          count: stat.count,
        },
      }), {}),
    }));

  } catch (error: any) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      formatError(error),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getAuthUser(request);
    const body = await request.json();

    // Validation
    validateRequest(body, ['type', 'amount', 'description']);

    if (body.amount <= 0) {
      throw new Error('Le montant doit être positif');
    }

    const transaction = new Transaction({
      userId,
      type: body.type,
      amount: Math.abs(body.amount),
      currency: body.currency || 'ADA',
      status: body.status || 'pending',
      description: body.description,
      projectId: body.projectId,
      projectTitle: body.projectTitle,
      paymentMethod: body.paymentMethod,
      walletAddress: body.walletAddress,
      metadata: body.metadata || {},
      notes: body.notes,
    });

    await transaction.save();

    return NextResponse.json(
      formatResponse(
        {
          transaction: {
            id: transaction._id.toString(),
            type: transaction.type,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.createdAt,
          },
        },
        'Transaction créée avec succès'
      ),
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create transaction error:', error);
    
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