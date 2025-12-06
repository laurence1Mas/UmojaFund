import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Project } from '@/lib/models/project'
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt'
import mongoose from 'mongoose'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    
    console.log('📄 Fetching project:', projectId)
    
    // Vérifier l'authentification
    const authHeader = req.headers.get('authorization')
    let isAuthenticated = false
    let userId: string | null = null
    let userRole: string | null = null
    
    if (authHeader) {
      try {
        const token = extractTokenFromHeader(authHeader)
        if (token) {
          const decoded = verifyToken(token)
          isAuthenticated = true
          userId = decoded.userId
          userRole = decoded.role
        }
      } catch (error) {
        console.log('Token verification failed, proceeding as guest')
      }
    }
    
    console.log('Auth status:', { isAuthenticated, userId, userRole })
    
    // Connexion à la base de données
    await connectDB()
    
    // Utiliser la collection MongoDB directement pour plus de flexibilité
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const projectsCollection = db.collection('projects')
    
    // Trouver le projet
    const project = await projectsCollection.findOne({
      _id: new mongoose.Types.ObjectId(projectId)
    })
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      )
    }
    
    console.log('Project status:', project.status)
    console.log('Project owner:', project.owner)
    console.log('Project creatorId:', project.creatorId)
    
    // Vérifier les permissions d'accès
    const isOwner = userId && (
      project.owner?.toString() === userId || 
      project.creatorId?.toString() === userId
    )
    const isAdmin = userRole === 'admin' || userRole === 'superadmin'
    const isProjectActive = project.status === 'active' || project.status === 'published' || project.status === 'completed'
    
    console.log('Permissions:', { isOwner, isAdmin, isProjectActive })
    
    // Règles d'accès :
    // 1. Les projets actifs/complétés sont visibles par tous
    // 2. Les projets draft/pending ne sont visibles que par le propriétaire ou les admins
    if (!isProjectActive && !isOwner && !isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ce projet n\'est pas encore disponible au public',
          message: 'Contacter l\'administrateur pour en savoir plus',
          status: project.status,
          isAuthenticated,
          isOwner,
          isAdmin
        },
        { status: 403 }
      )
    }
    
    // Récupérer les informations du propriétaire
    let ownerInfo = null
    if (project.owner || project.creatorId) {
      const usersCollection = db.collection('users')
      const ownerId = project.owner || project.creatorId
      
      ownerInfo = await usersCollection.findOne(
        { _id: new mongoose.Types.ObjectId(ownerId.toString()) },
        { projection: { name: 1, email: 1, avatar: 1 } }
      )
    }
    
    // Formater la réponse
    const formattedProject = {
      id: project._id.toString(),
      _id: project._id.toString(),
      title: project.title || 'Sans titre',
      owner: ownerInfo || { 
        _id: project.owner?.toString() || project.creatorId?.toString() || '',
        name: 'Inconnu', 
        email: '' 
      },
      description: project.description || '',
      shortDescription: project.shortDescription || '',
      category: project.category || 'other',
      creatorId: project.creatorId?.toString(),
      creatorName: project.creatorName || ownerInfo?.name || 'Inconnu',
      fundingGoal: project.fundingGoal || project.goalADA || 0,
      fundedAmount: project.fundedAmount || project.raisedADA || 0,
      currency: project.currency || 'ADA',
      status: project.status || 'draft',
      startDate: project.startDate || project.createdAt,
      endDate: project.endDate || project.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      duration: project.duration || 30,
      minInvestment: project.minInvestment || 10,
      expectedROI: project.expectedROI || 0,
      images: project.images || [],
      story: project.story || '',
      risks: project.risks || '',
      updates: project.updates || [],
      backersCount: project.backersCount || 0,
      investors: project.investors || [],
      milestones: project.milestones || [],
      tags: project.tags || [],
      featured: project.featured || false,
      verified: project.verified || false,
      createdAt: project.createdAt || new Date(),
      updatedAt: project.updatedAt || new Date(),
      // Permissions pour le frontend
      permissions: {
        canEdit: isOwner || isAdmin,
        canInvest: isProjectActive && !isOwner, // Le propriétaire ne peut pas investir dans son propre projet
        canView: true
      }
    }
    
    return NextResponse.json({
      success: true,
      data: formattedProject
    })
    
  } catch (error: any) {
    console.error('Error fetching project:', error)
    
    // Si l'ID n'est pas un ObjectId valide
    if (error.message.includes('ObjectId') || error.message.includes('Cast to ObjectId')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de projet invalide'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du projet',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}