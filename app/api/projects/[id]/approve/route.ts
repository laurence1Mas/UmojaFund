import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/utils/jwt'
import mongoose from 'mongoose'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    
    console.log('Approving project:', projectId)
    
    // Vérifier l'authentification
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader
    
    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Admin uniquement' },
        { status: 403 }
      )
    }

    // Lire le corps de la requête avec gestion d'erreur
    let body = {}
    try {
      const text = await req.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (e) {
      console.log('No body or invalid JSON, using empty object')
    }

    const { reviewedBy, notes } = body as any

    // Connexion à la base de données
    await connectDB()

    // Vérifier si c'est un ID mock
    if (projectId.startsWith('mock-')) {
      console.log('Mock project approval')
      
      return NextResponse.json({
        success: true,
        message: 'Projet approuvé avec succès (simulation)',
        data: {
          project: {
            id: projectId,
            status: 'active',
            verified: true,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            reviewedBy: reviewedBy || decoded.email || 'Admin',
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      })
    }

    // Pour les vrais projets MongoDB
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database not connected')
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

    console.log('Current project status:', project.status)

    // Vérifier que le projet peut être approuvé
    if (project.status !== 'pending' && project.status !== 'draft') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Le projet ne peut pas être approuvé. Statut actuel: ${project.status}` 
        },
        { status: 400 }
      )
    }

    // Préparer la mise à jour
    const updateData: any = {
      status: 'active',
      verified: true,
      updatedAt: new Date(),
      reviewedBy: reviewedBy || decoded.email || 'Admin',
      reviewedAt: new Date()
    }

    // Migration des champs si nécessaire
    if (project.goalADA && !project.fundingGoal) {
      updateData.fundingGoal = project.goalADA
    }
    
    if (project.raisedADA !== undefined && !project.fundedAmount) {
      updateData.fundedAmount = project.raisedADA
    }
    
    if (project.deadline && !project.endDate) {
      updateData.endDate = project.deadline
    }
    
    if (!project.startDate) {
      updateData.startDate = new Date()
    }

    if (notes) {
      updateData.reviewNotes = notes
    }

    console.log('Updating project with:', updateData)

    // Mettre à jour le projet
    const result = await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(projectId) },
      { $set: updateData }
    )

    console.log('Update result:', result)

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune modification apportée' },
        { status: 400 }
      )
    }

    // Récupérer le projet mis à jour
    const updatedProject = await projectsCollection.findOne({
      _id: new mongoose.Types.ObjectId(projectId)
    })

    return NextResponse.json({
      success: true,
      message: 'Projet approuvé avec succès',
      data: {
        project: {
          id: updatedProject._id.toString(),
          title: updatedProject.title,
          status: updatedProject.status,
          verified: updatedProject.verified,
          startDate: updatedProject.startDate || updatedProject.createdAt,
          endDate: updatedProject.endDate || updatedProject.deadline,
          reviewedBy: updatedProject.reviewedBy,
          reviewedAt: updatedProject.reviewedAt,
          updatedAt: updatedProject.updatedAt,
          // Anciens champs pour compatibilité
          goalADA: updatedProject.goalADA,
          raisedADA: updatedProject.raisedADA,
          deadline: updatedProject.deadline
        }
      }
    })

  } catch (error: any) {
    console.error('Error approving project:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}