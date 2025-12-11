// app/api/debug/fix-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/lib/models/Transaction';
import { Project } from '@/lib/models/Project';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Récupérer tous les utilisateurs
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).limit(10).toArray();
    
    const userStats = [];
    
    for (const user of users) {
      const userId = user._id.toString();
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      // Transactions
      const transactions = await Transaction.find({ userId: userObjectId }).lean();
      const investments = transactions.filter(t => t.type === 'investment');
      const totalInvested = investments.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      // Projets
      const projects = await Project.find({
        'investors.userId': userObjectId
      }).lean();
      
      const projectInvestments = projects.reduce((sum, project) => {
        const userInv = project.investors?.find((inv: any) => 
          inv.userId && inv.userId.toString() === userId
        );
        return sum + (userInv?.amount || 0);
      }, 0);
      
      userStats.push({
        userId,
        name: user.name || user.email,
        transactions: {
          count: transactions.length,
          investments: investments.length,
          totalInvested
        },
        projects: {
          count: projects.length,
          totalInvested: projectInvestments
        },
        discrepancy: totalInvested !== projectInvestments
      });
    }
    
    return NextResponse.json({
      success: true,
      data: userStats
    });
    
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}