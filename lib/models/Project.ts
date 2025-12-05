import mongoose from 'mongoose';
import { IUser } from './User';

export interface ITeamMember {
  name: string;
  role: string;
  experience?: string;
}

export interface IRisk {
  description: string;
  mitigation: string;
}

export interface ITimelinePhase {
  phase: string;
  duration: string;
  activities: string[];
}

export interface IProject extends mongoose.Document {
  // Champs de base
  title: string;
  description: string;
  imageUrl?: string;
  pdfUrl?: string;
  goalADA: number;
  raisedADA: number;
  deadline: Date;
  owner: mongoose.Types.ObjectId | IUser;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'funded';
  smartContractAddress?: string;
  
  // Champs supplémentaires pour détail
  category?: string;
  location?: string;
  durationMonths?: number;
  beneficiaries?: number; // Nombre de bénéficiaires
  jobsCreated?: number; // Emplois créés
  
  // Équipe, risques, planning
  team?: ITeamMember[];
  risks?: IRisk[];
  timeline?: ITimelinePhase[];
  
  // Métadonnées
  tags?: string[];
  socialMedia?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [120, 'Le titre ne peut pas dépasser 120 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      maxlength: [10000, 'La description ne peut pas dépasser 10,000 caractères'],
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    },
    pdfUrl: {
      type: String,
      default: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    goalADA: {
      type: Number,
      required: [true, 'Le objectif en ADA est requis'],
      min: [10, 'Le objectif minimum est 10 ADA'],
    },
    raisedADA: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'La date limite est requise'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected', 'funded'],
      default: 'draft',
    },
    smartContractAddress: {
      type: String,
      trim: true,
    },
    
    // Champs supplémentaires
    category: {
      type: String,
      trim: true,
      enum: [
        'agriculture', 
        'éducation', 
        'santé', 
        'technologie', 
        'infrastructure', 
        'énergie', 
        'eau', 
        'environnement',
        'art-culture',
        'sport',
        'autre'
      ],
    },
    location: {
      type: String,
      trim: true,
    },
    durationMonths: {
      type: Number,
      min: 1,
      max: 60,
    },
    beneficiaries: {
      type: Number,
      min: 1,
    },
    jobsCreated: {
      type: Number,
      min: 0,
    },
    
    // Structures complexes
    team: [{
      name: { 
        type: String, 
        required: [true, 'Le nom du membre est requis'],
        trim: true,
      },
      role: { 
        type: String, 
        required: [true, 'Le rôle est requis'],
        trim: true,
      },
      experience: { 
        type: String,
        trim: true,
      },
    }],
    
    risks: [{
      description: { 
        type: String, 
        required: [true, 'La description du risque est requise'],
        trim: true,
      },
      mitigation: { 
        type: String, 
        required: [true, 'La mitigation est requise'],
        trim: true,
      },
    }],
    
    timeline: [{
      phase: { 
        type: String, 
        required: [true, 'La phase est requise'],
        trim: true,
      },
      duration: { 
        type: String, 
        required: [true, 'La durée est requise'],
        trim: true,
      },
      activities: [{ 
        type: String,
        trim: true,
      }],
    }],
    
    // Métadonnées
    tags: [{
      type: String,
      trim: true,
    }],
    
    socialMedia: {
      website: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index pour les recherches
ProjectSchema.index({ status: 1, deadline: 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ raisedADA: -1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ location: 1 });
ProjectSchema.index({ tags: 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);