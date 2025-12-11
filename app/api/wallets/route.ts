// app/api/wallets/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/lib/models/Wallet";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    await connectDB();
    const wallets = await Wallet.find({ userId }).lean();
    return NextResponse.json({ success: true, wallets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch wallets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, label, address, number } = body;
    if (!userId || !type || !label || (!address && !number)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const wallet = await Wallet.create({ userId, type, label, address, number, balance: 0, transactions: [] });
    return NextResponse.json({ success: true, wallet });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to create wallet" }, { status: 500 });
  }
}
