import mongoose from 'mongoose';

export interface ITransaction extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'investment' | 'refund' | 'dividend' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  
  // For investments
  projectId?: mongoose.Types.ObjectId;
  projectTitle?: string;
  
  // Payment details
  paymentMethod?: string;
  transactionId?: string; // External transaction ID
  walletAddress?: string;
  
  metadata?: Record<string, any>;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['deposit', 'withdrawal', 'investment', 'refund', 'dividend', 'fee'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'ADA',
      enum: ['ADA', 'USD', 'EUR', 'GBP', 'JPY'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Investment related
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    projectTitle: {
      type: String,
      trim: true,
    },
    
    // Payment details
    paymentMethod: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    walletAddress: {
      type: String,
      trim: true,
    },
    
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: {
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

// Indexes for faster queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);