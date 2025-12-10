import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  walletAddress?: string;
  role: 'user' | 'admin';

  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;

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

  stats?: {
    totalFunded: number;
    activeProjects: number;
    totalReturns: number;
    portfolioValue: number;
    totalContributions: number;
    pendingReturns: number;
    lastUpdated: Date;
  };

  twoFactorEnabled?: boolean;
  lastPasswordChange?: Date;
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  updateStats(newStats: Partial<IUser['stats']>): Promise<void>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },

    passwordHash: {
      type: String,
      required: true,
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

    // Profile
    phone: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    location: { type: String, trim: true },
    website: { type: String, trim: true },
    avatar: { type: String, trim: true },

    // Preferences
    preferences: {
      language: { type: String, default: 'en', enum: ['en', 'fr', 'es', 'de', 'pt'] },
      currency: { type: String, default: 'ADA', enum: ['ADA', 'USD', 'EUR', 'GBP', 'JPY'] },
      timezone: { type: String, default: 'UTC' },
      theme: { type: String, default: 'system', enum: ['light', 'dark', 'system'] },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      },
      notifications: {
        email: { default: true, type: Boolean },
        projectUpdates: { default: true, type: Boolean },
        fundingAlerts: { default: true, type: Boolean },
        weeklyDigest: { default: false, type: Boolean },
        marketingEmails: { default: false, type: Boolean },
        push: { default: true, type: Boolean },
      },
    },

    // Stats
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
    twoFactorEnabled: { type: Boolean, default: false },
    lastPasswordChange: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    accountLockedUntil: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
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

// Compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch {
    return false;
  }
};

// Update user stats
UserSchema.methods.updateStats = async function (
  newStats: Partial<IUser['stats']>
) {
  this.stats = {
    ...this.stats,
    ...newStats,
    lastUpdated: new Date(),
  };

  await this.save();
};

export const User =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
