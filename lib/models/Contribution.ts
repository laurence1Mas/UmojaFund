import mongoose from 'mongoose';
import { IUser } from './User';
import { IProject } from './Project';

export interface IContribution extends mongoose.Document {
  project: mongoose.Types.ObjectId | IProject;
  user?: mongoose.Types.ObjectId | IUser;
  amountADA: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new mongoose.Schema<IContribution>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    amountADA: {
      type: Number,
      required: [true, 'Le montant en ADA est requis'],
      min: [1, 'Le montant minimum est 1 ADA'],
    },
    txHash: {
      type: String,
      required: [true, 'Le hash de transaction est requis'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    date: {
      type: Date,
      default: Date.now,
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
ContributionSchema.index({ project: 1, status: 1 });
ContributionSchema.index({ txHash: 1 }, { unique: true });
ContributionSchema.index({ user: 1, date: -1 });

export const Contribution = mongoose.models.Contribution || mongoose.model<IContribution>('Contribution', ContributionSchema);