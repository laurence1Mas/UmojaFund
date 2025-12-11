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
// Dans le même fichier que votre GET, ajoutez :
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    
    console.log('✏️ Updating project:', projectId)
    
    // Authentification obligatoire pour PUT
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const token = extractTokenFromHeader(authHeader)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      )
    }
    
    const decoded = verifyToken(token)
    const userId = decoded.userId
    const userRole = decoded.role
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }
    
    // Lire les données de la requête
    let updateData
    try {
      updateData = await req.json()
      console.log('Update data received:', updateData)
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Données JSON invalides' },
        { status: 400 }
      )
    }
    
    // Connexion à la base de données
    await connectDB()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const projectsCollection = db.collection('projects')
    
    // Vérifier si le projet existe et les permissions
    const existingProject = await projectsCollection.findOne({
      _id: new mongoose.Types.ObjectId(projectId)
    })
    
    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      )
    }
    
    // Vérifier les permissions
    const isOwner = userId && (
      existingProject.owner?.toString() === userId || 
      existingProject.creatorId?.toString() === userId
    )
    const isAdmin = userRole === 'admin' || userRole === 'superadmin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vous n\'avez pas la permission de modifier ce projet'
        },
        { status: 403 }
      )
    }
    
    // Liste des champs autorisés à être modifiés
    const allowedFields = [
      'title',
      'description',
      'shortDescription',
      'category',
      'fundingGoal',
      'minInvestment',
      'expectedROI',
      'endDate',
      'duration',
      'images',
      'story',
      'risks',
      'updates',
      'milestones',
      'tags',
      'status' // Attention: restreindre les changements de status
    ]
    
    // Filtrer les données pour n'inclure que les champs autorisés
    const filteredUpdate: any = {}
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        // Gestion spéciale pour certains champs
        if (key === 'status') {
          // Seuls les admins peuvent changer certains statuts
          if (updateData.status === 'verified' && !isAdmin) {
            return // Skip: seul un admin peut vérifier un projet
          }
          if (updateData.status === 'active' && !isAdmin && !isOwner) {
            return // Skip: restrictions sur l'activation
          }
        }
        filteredUpdate[key] = updateData[key]
      }
    })
    
    // Ajouter la date de mise à jour
    filteredUpdate.updatedAt = new Date()
    
    console.log('Filtered update:', filteredUpdate)
    
    // Mettre à jour le projet
    const result = await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(projectId) },
      { $set: filteredUpdate }
    )
    
    if (result.modifiedCount === 0) {
      console.log('No changes made to project')
    }
    
    // Récupérer le projet mis à jour
    const updatedProject = await projectsCollection.findOne({
      _id: new mongoose.Types.ObjectId(projectId)
    })
    
    // Récupérer les informations du propriétaire
    let ownerInfo = null
    if (updatedProject.owner || updatedProject.creatorId) {
      const usersCollection = db.collection('users')
      const ownerId = updatedProject.owner || updatedProject.creatorId
      
      ownerInfo = await usersCollection.findOne(
        { _id: new mongoose.Types.ObjectId(ownerId.toString()) },
        { projection: { name: 1, email: 1, avatar: 1 } }
      )
    }
    
    // Formater la réponse
    const formattedProject = {
      id: updatedProject._id.toString(),
      _id: updatedProject._id.toString(),
      title: updatedProject.title || 'Sans titre',
      owner: ownerInfo || { 
        _id: updatedProject.owner?.toString() || updatedProject.creatorId?.toString() || '',
        name: 'Inconnu', 
        email: '' 
      },
      description: updatedProject.description || '',
      shortDescription: updatedProject.shortDescription || '',
      category: updatedProject.category || 'other',
      creatorId: updatedProject.creatorId?.toString(),
      creatorName: updatedProject.creatorName || ownerInfo?.name || 'Inconnu',
      fundingGoal: updatedProject.fundingGoal || updatedProject.goalADA || 0,
      fundedAmount: updatedProject.fundedAmount || updatedProject.raisedADA || 0,
      currency: updatedProject.currency || 'ADA',
      status: updatedProject.status || 'draft',
      startDate: updatedProject.startDate || updatedProject.createdAt,
      endDate: updatedProject.endDate || updatedProject.deadline,
      duration: updatedProject.duration || 30,
      minInvestment: updatedProject.minInvestment || 10,
      expectedROI: updatedProject.expectedROI || 0,
      images: updatedProject.images || [],
      story: updatedProject.story || '',
      risks: updatedProject.risks || '',
      updates: updatedProject.updates || [],
      backersCount: updatedProject.backersCount || 0,
      investors: updatedProject.investors || [],
      milestones: updatedProject.milestones || [],
      tags: updatedProject.tags || [],
      featured: updatedProject.featured || false,
      verified: updatedProject.verified || false,
      createdAt: updatedProject.createdAt || new Date(),
      updatedAt: updatedProject.updatedAt || new Date(),
      permissions: {
        canEdit: isOwner || isAdmin,
        canInvest: (updatedProject.status === 'active' || updatedProject.status === 'published') && !isOwner,
        canView: true
      }
    }
    
    return NextResponse.json({
      success: true,
      data: formattedProject,
      message: 'Projet mis à jour avec succès'
    })
    
  } catch (error: any) {
    console.error('Error updating project:', error)
    
    if (error.message.includes('ObjectId') || error.message.includes('Cast to ObjectId')) {
      return NextResponse.json(
        { success: false, error: 'ID de projet invalide' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour du projet',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Vous pouvez aussi ajouter DELETE si nécessaire
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    
    console.log('🗑️ Deleting project:', projectId)
    
    // Authentification
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const token = extractTokenFromHeader(authHeader)
    const decoded = verifyToken(token)
    const userId = decoded.userId
    const userRole = decoded.role
    
    await connectDB()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const projectsCollection = db.collection('projects')
    
    // Vérifier le projet
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
    const isOwner = userId && (
      project.owner?.toString() === userId || 
      project.creatorId?.toString() === userId
    )
    const isAdmin = userRole === 'admin' || userRole === 'superadmin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Permission refusée' },
        { status: 403 }
      )
    }
    
    // Empêcher la suppression de projets actifs avec des investisseurs
    if (project.status === 'active' && project.investors?.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer un projet actif avec des investisseurs',
          suggestion: 'Mettez d\'abord le projet en statut "cancelled"'
        },
        { status: 400 }
      )
    }
    
    // Supprimer le projet (soft delete - marquer comme supprimé)
    const result = await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(projectId) },
      { 
        $set: { 
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: userId
        } 
      }
    )
    
    // Ou pour une suppression complète :
    // const result = await projectsCollection.deleteOne({
    //   _id: new mongoose.Types.ObjectId(projectId)
    // })
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Échec de la suppression' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès'
    })
    
  } catch (error: any) {
    console.error('Error deleting project:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}