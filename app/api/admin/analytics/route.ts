import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { Contribution } from '@/lib/models/Contribution';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Récupérer toutes les stats
    const [
      totalProjects,
      totalUsers,
      totalContributions,
      totalRaised,
      publishedProjects,
      pendingProjects,
      recentContributions,
      topProjects
    ] = await Promise.all([
      Project.countDocuments(),
      User.countDocuments(),
      Contribution.countDocuments({ status: 'confirmed' }),
      Contribution.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amountADA' } } }
      ]),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'pending' }),
      Contribution.find({ status: 'confirmed' })
        .sort({ date: -1 })
        .limit(10)
        .populate('project', 'title')
        .populate('user', 'name'),
      Project.find({ status: 'active' })
        .sort({ raisedADA: -1 })
        .limit(5)
        .populate('owner', 'name')
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          totalUsers,
          totalContributions: totalContributions,
          totalRaised: totalRaised[0]?.total || 0,
          publishedProjects,
          pendingProjects,
        },
        recentActivity: {
          contributions: recentContributions,
        },
        topProjects: topProjects.map(p => ({
          id: p._id,
          title: p.title,
          owner: p.owner?.name,
          goalADA: p.goalADA,
          raisedADA: p.raisedADA,
          percentage: Math.round((p.raisedADA / p.goalADA) * 100)
        })),
        charts: {
          // Données pour graphiques
          projectsByStatus: {
            draft: await Project.countDocuments({ status: 'draft' }),
            pending: pendingProjects,
            published: publishedProjects,
            funded: await Project.countDocuments({ status: 'funded' }),
            rejected: await Project.countDocuments({ status: 'rejected' }),
          },
          contributionsByDay: await getContributionsByDay()
        }
      }
    });
    
  } catch (error: any) {
    console.error('Analytics error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur récupération analytics' 
      },
      { status: 500 }
    );
  }
}

async function getContributionsByDay() {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const count = await Contribution.countDocuments({
      status: 'confirmed',
      date: { $gte: date, $lt: nextDay }
    });
    
    last7Days.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  return last7Days;
}