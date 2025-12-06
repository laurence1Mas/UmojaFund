import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Project } from '@/lib/models/Project'
import { verifyToken, extractTokenFromHeader } from '@/lib/utils/jwt'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    // Vérifier l'authentification admin
    const token = extractTokenFromHeader(req.headers)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Admin uniquement' },
        { status: 403 }
      )
    }

    const { status, reason, reviewedBy } = await req.json()

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Statut requis' },
        { status: 400 }
      )
    }

    // Valider le statut
    const validStatuses = ['draft', 'pending', 'active', 'completed', 'cancelled', 'failed', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Statut non valide' },
        { status: 400 }
      )
    }

    // Connexion à la base de données
    await connectDB()

    // Trouver le projet
    const project = await Project.findById(projectId)

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le projet
    project.status = status
    project.updatedAt = new Date()

    // Logique spécifique selon le statut
    switch (status) {
      case 'active':
        project.verified = true
        if (!project.startDate) {
          project.startDate = new Date()
          
          // Calculer la date de fin si elle n'existe pas
          if (project.duration && !project.endDate) {
            const endDate = new Date(project.startDate)
            endDate.setDate(endDate.getDate() + project.duration)
            project.endDate = endDate
          }
        }
        break
        
      case 'completed':
        if (!project.endDate) {
          project.endDate = new Date()
        }
        break
        
      case 'rejected':
      case 'cancelled':
      case 'failed':
        // Ajouter la raison si fournie
        if (reason) {
          project.reviewNotes = reason
        }
        break
    }

    // Ajouter les informations de review
    if (reviewedBy) {
      project.reviewedBy = reviewedBy
      project.reviewedAt = new Date()
    }

    await project.save()

    return NextResponse.json({
      success: true,
      message: `Statut du projet mis à jour: ${status}`,
      data: {
        project: {
          id: project._id.toString(),
          title: project.title,
          status: project.status,
          verified: project.verified,
          startDate: project.startDate,
          endDate: project.endDate,
          updatedAt: project.updatedAt
        }
      }
    })

  } catch (error: any) {
    console.error('Error updating project status:', error)
    
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