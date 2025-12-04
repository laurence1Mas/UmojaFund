import mongoose from 'mongoose';
import { IUser } from './User';

export interface IProject extends mongoose.Document {
  title: string;
  description: string;
  imageUrl: string;
  pdfUrl: string;
  goalADA: number;
  raisedADA: number;
  deadline: Date;
  owner: mongoose.Types.ObjectId | IUser;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'funded';
  smartContractAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    imageUrl: {
      type: String,
      required: [true, "L'image est requise"],
    },
    pdfUrl: {
      type: String,
      required: [true, 'Le PDF est requis'],
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
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: 'La date limite doit être dans le futur',
      },
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

// Index pour les requêtes fréquentes
ProjectSchema.index({ status: 1, deadline: 1 });
ProjectSchema.index({ owner: 1, status: 1 });
ProjectSchema.index({ raisedADA: -1 });

// Middleware pour valider qu'un utilisateur n'a qu'une seule campagne active
ProjectSchema.pre('save', async function (next) {
  if (this.status !== 'draft' && this.status !== 'rejected') {
    const existingProject = await mongoose.models.Project.findOne({
      owner: this.owner,
      status: { $in: ['pending', 'published', 'funded'] },
      _id: { $ne: this._id },
    });
    
    if (existingProject) {
      next(new Error('Un utilisateur ne peut avoir qu\'une seule campagne active à la fois'));
    }
  }
  next();
});

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);