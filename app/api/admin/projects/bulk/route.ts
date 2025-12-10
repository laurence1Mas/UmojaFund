import { NextRequest, NextResponse } from 'next/server'
import { connectDB} from '@/lib/db'
import {Project} from './../../../../../lib/models/Project'
import { verifyToken } from './../../../../../lib/utils/jwt'
import mongoose from 'mongoose'

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { projectIds, action, reason } = body

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Liste de projets requise' },
        { status: 400 }
      )
    }

    if (!action || !['active', 'pending', 'rejected', 'cancelled'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action non valide' },
        { status: 400 }
      )
    }

    await connectDB()

    // Valider les IDs
    const validIds = projectIds.filter(id => mongoose.Types.ObjectId.isValid(id))
    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun ID valide' },
        { status: 400 }
      )
    }

    // Mettre à jour les projets en masse
    const updateResult = await Project.updateMany(
      { _id: { $in: validIds } },
      {
        $set: {
          status: action,
          updatedAt: new Date(),
          ...(action === 'active' ? { verified: true } : {})
        },
        $push: {
          statusHistory: {
            $each: validIds.map(() => ({
              to: action,
              reason: reason || '',
              reviewedBy: decoded.name,
              reviewedAt: new Date()
            }))
          }
        }
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      },
      message: `${updateResult.modifiedCount} projet(s) mis à jour avec succès`
    })

  } catch (error: any) {
    console.error('Error in bulk project update:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}