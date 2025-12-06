import mongoose from 'mongoose';

export interface IProject extends mongoose.Document {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  
  owner: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  creatorName: string;
  
  fundingGoal: number;
  fundedAmount: number;
  currency: string;
  
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';
  
  // Timeline
  startDate: Date;
  endDate: Date;
  duration: number;
  
  // Investment details
  minInvestment: number;
  maxInvestment?: number;
  expectedROI: number;
  
  // Media
  images: string[];
  videoUrl?: string;
  
  // Content
  story: string;
  risks: string;
  updates: Array<{
    title: string;
    content: string;
    date: Date;
    images?: string[];
  }>;
  
  // Statistics
  backersCount: number;
  investors: Array<{
    userId: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    returns?: number;
  }>;
  
  // Milestones
  milestones: Array<{
    title: string;
    description: string;
    amountRequired: number;
    completionDate?: Date;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
  
  // Metadata
  tags: string[];
  featured: boolean;
  verified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 50,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: ['environment', 'education', 'technology', 'health', 'agriculture', 'energy', 'community', 'arts', 'other'],
    },
    
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    
    fundingGoal: {
      type: Number,
      required: true,
      min: 1,
    },
    fundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'ADA',
      enum: ['ADA', 'USD', 'EUR', 'GBP', 'JPY'],
    },
    
    status: {
      type: String,
      required: true,
      enum: ['draft', 'pending', 'active', 'completed', 'cancelled', 'failed'],
      default: 'draft',
    },
    
    // Timeline
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    
    // Investment details
    minInvestment: {
      type: Number,
      required: true,
      min: 1,
    },
    maxInvestment: {
      type: Number,
    },
    expectedROI: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Media
    images: [{
      type: String,
      trim: true,
    }],
    videoUrl: {
      type: String,
      trim: true,
    },
    
    // Content
    story: {
      type: String,
      required: true,
    },
    risks: {
      type: String,
      required: true,
    },
    updates: [{
      title: String,
      content: String,
      date: Date,
      images: [String],
    }],
    
    // Statistics
    backersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    investors: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      amount: Number,
      date: Date,
      returns: Number,
    }],
    
    // Milestones
    milestones: [{
      title: String,
      description: String,
      amountRequired: Number,
      completionDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
      },
    }],
    
    // Metadata
    tags: [{
      type: String,
      trim: true,
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
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

// Indexes
ProjectSchema.index({ status: 1, endDate: 1 });
ProjectSchema.index({ creatorId: 1, createdAt: -1 });
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ featured: 1, createdAt: -1 });
ProjectSchema.index({ verified: 1, status: 1 });
ProjectSchema.index({ 'investors.userId': 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);