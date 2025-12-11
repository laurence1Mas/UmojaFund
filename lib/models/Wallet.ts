// lib/models/Wallet.ts
import mongoose, { Schema } from 'mongoose';

export interface IWallet extends mongoose.Document {
  userId: string;
  type: 'cardano' | 'mobilemoney';
  label: string; // Ex: "Personal Cardano Wallet" ou "MTN Mobile Money"
  address?: string; // pour Cardano
  number?: string; // pour Mobile Money
  balance: number;
  transactions: {
    date: Date;
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['cardano', 'mobilemoney'], required: true },
  label: { type: String, required: true },
  address: { type: String, trim: true },
  number: { type: String, trim: true },
  balance: { type: Number, default: 0 },
  transactions: [
    {
      date: { type: Date, default: Date.now },
      amount: { type: Number, required: true },
      description: { type: String },
      status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    },
  ],
}, { timestamps: true });

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
