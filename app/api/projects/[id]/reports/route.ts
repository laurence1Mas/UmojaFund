import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Project } from '@/lib/models/project'
import { verifyToken } from '@/lib/utils/jwt'
import mongoose from 'mongoose'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    console.log('📊 Fetching reports for project:', projectId)
    
    // Authentification optionnelle pour les rapports
    const authHeader = req.headers.get('authorization')
    let isAuthenticated = false
    let isAdmin = false
    let userId: string | null = null
    
    if (authHeader) {
      try {
        const token = authHeader.startsWith('Bearer ') 
          ? authHeader.split(' ')[1] 
          : authHeader
        
        if (token) {
          const decoded = verifyToken(token)
          isAuthenticated = true
          userId = decoded.userId
          isAdmin = decoded.role === 'admin' || decoded.role === 'superadmin'
        }
      } catch (error) {
        console.log('Token verification failed, proceeding as guest')
      }
    }
    
    // Connexion à la base de données
    await connectDB()
    
    // Récupérer le projet avec toutes les données nécessaires
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const projectsCollection = db.collection('projects')
    const project = await projectsCollection.findOne({
      _id: new mongoose.Types.ObjectId(projectId)
    })
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      )
    }
    
    // Vérifier les permissions
    const isCreator = project.creatorId?.toString() === userId || 
                      project.owner?.toString() === userId
    const hasInvested = project.investors?.some(
      (inv: any) => inv.userId?.toString() === userId
    )
    
    // Seuls le créateur, les investisseurs et les admins peuvent voir les rapports détaillés
    if (!isCreator && !hasInvested && !isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Accès non autorisé aux rapports détaillés',
          isAuthenticated,
          isCreator,
          hasInvested,
          isAdmin
        },
        { status: 403 }
      )
    }
    
    // Récupérer les utilisateurs pour les noms des investisseurs
    const usersCollection = db.collection('users')
    const investorIds = project.investors?.map((inv: any) => inv.userId) || []
    
    const users = await usersCollection.find({
      _id: { $in: investorIds.map((id: any) => new mongoose.Types.ObjectId(id)) }
    }).toArray()
    
    const userMap = new Map()
    users.forEach(user => {
      userMap.set(user._id.toString(), {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      })
    })
    
    // Préparer les données des investisseurs
    const investorsData = (project.investors || []).map((inv: any) => {
      const user = userMap.get(inv.userId?.toString())
      return {
        userId: inv.userId?.toString(),
        userName: user?.name || 'Investisseur anonyme',
        userEmail: user?.email,
        userAvatar: user?.avatar,
        amount: inv.amount || 0,
        date: inv.date || new Date(),
        returns: inv.returns || 0,
        roi: inv.amount > 0 ? ((inv.returns || 0) / inv.amount * 100).toFixed(1) : '0.0'
      }
    })
    
    // Statistiques des investissements
    const investmentStats = {
      totalInvested: investorsData.reduce((sum, inv) => sum + inv.amount, 0),
      averageInvestment: investorsData.length > 0 
        ? investorsData.reduce((sum, inv) => sum + inv.amount, 0) / investorsData.length 
        : 0,
      maxInvestment: investorsData.length > 0 
        ? Math.max(...investitorsData.map(inv => inv.amount)) 
        : 0,
      minInvestment: investorsData.length > 0 
        ? Math.min(...investitorsData.map(inv => inv.amount)) 
        : 0,
      totalReturns: investorsData.reduce((sum, inv) => sum + inv.returns, 0),
      investorCount: investorsData.length
    }
    
    // Évolution des investissements par jour
    const investmentTimeline = (project.investors || [])
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc: any[], inv: any, index: number) => {
        const date = new Date(inv.date).toISOString().split('T')[0]
        const existing = acc.find(item => item.date === date)
        
        if (existing) {
          existing.amount += inv.amount
          existing.count += 1
        } else {
          acc.push({
            date,
            amount: inv.amount,
            count: 1,
            cumulativeAmount: (acc[acc.length - 1]?.cumulativeAmount || 0) + inv.amount
          })
        }
        
        return acc
      }, [])
    
    // Statistiques des milestones
    const milestoneStats = {
      total: project.milestones?.length || 0,
      completed: project.milestones?.filter((m: any) => m.status === 'completed').length || 0,
      inProgress: project.milestones?.filter((m: any) => m.status === 'in-progress').length || 0,
      pending: project.milestones?.filter((m: any) => m.status === 'pending').length || 0,
      totalAmountRequired: project.milestones?.reduce((sum: number, m: any) => sum + (m.amountRequired || 0), 0) || 0,
      completedAmount: project.milestones?.filter((m: any) => m.status === 'completed')
        .reduce((sum: number, m: any) => sum + (m.amountRequired || 0), 0) || 0
    }
    
    // Données pour les graphiques
    const fundingProgress = {
      goal: project.fundingGoal || project.goalADA || 0,
      funded: project.fundedAmount || project.raisedADA || 0,
      percentage: (project.fundingGoal || project.goalADA) > 0 
        ? ((project.fundedAmount || project.raisedADA) / (project.fundingGoal || project.goalADA) * 100) 
        : 0,
      daysLeft: Math.max(
        0,
        Math.ceil((new Date(project.endDate || project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        project: {
          id: project._id.toString(),
          title: project.title,
          status: project.status,
          category: project.category,
          creatorName: project.creatorName,
          createdAt: project.createdAt,
          startDate: project.startDate,
          endDate: project.endDate || project.deadline,
          verified: project.verified || false
        },
        stats: {
          investment: investmentStats,
          milestones: milestoneStats,
          funding: fundingProgress,
          backersCount: project.backersCount || 0,
          updatesCount: project.updates?.length || 0
        },
        investors: investorsData.sort((a, b) => b.amount - a.amount),
        investmentTimeline,
        milestones: project.milestones || [],
        updates: project.updates || [],
        permissions: {
          isCreator,
          isAdmin,
          hasInvested,
          canEdit: isCreator || isAdmin
        }
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error fetching project reports:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des rapports',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}