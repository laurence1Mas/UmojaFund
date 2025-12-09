import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  walletAddress?: string;
  role: 'user' | 'admin';
  
  // Profile fields
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  
  // Preferences
  preferences?: {
    language: string;
    currency: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    dateFormat: string;
    notifications: {
      email: boolean;
      projectUpdates: boolean;
      fundingAlerts: boolean;
      weeklyDigest: boolean;
      marketingEmails: boolean;
      push: boolean;
    };
  };
  
  // Statistics (cached for performance)
  stats?: {
    totalFunded: number;
    activeProjects: number;
    totalReturns: number;
    portfolioValue: number;
    totalContributions: number;
    pendingReturns: number;
    lastUpdated: Date;
  };
  
  // Security
  twoFactorEnabled?: boolean;
  lastPasswordChange?: Date;
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir un email valide'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
    },
    walletAddress: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    
    // Profile fields
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'La bio ne peut pas dépasser 500 caractères'],
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    
    // Preferences
    preferences: {
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'fr', 'es', 'de', 'pt'],
      },
      currency: {
        type: String,
        default: 'ADA',
        enum: ['ADA', 'USD', 'EUR', 'GBP', 'JPY'],
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      theme: {
        type: String,
        default: 'system',
        enum: ['light', 'dark', 'system'],
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      },
      notifications: {
        email: { type: Boolean, default: true },
        projectUpdates: { type: Boolean, default: true },
        fundingAlerts: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
        marketingEmails: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
    },
    
    // Statistics
    stats: {
      totalFunded: { type: Number, default: 0 },
      activeProjects: { type: Number, default: 0 },
      totalReturns: { type: Number, default: 0 },
      portfolioValue: { type: Number, default: 0 },
      totalContributions: { type: Number, default: 0 },
      pendingReturns: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    
    // Security
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountLockedUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        delete ret.failedLoginAttempts;
        delete ret.accountLockedUntil;
        return ret;
      },
    },
  }
);

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

// Méthode pour mettre à jour les stats
UserSchema.methods.updateStats = async function (newStats: Partial<IUser['stats']>) {
  this.stats = {
    ...this.stats,
    ...newStats,
    lastUpdated: new Date(),
  };
  await this.save();
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);