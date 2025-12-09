import { NextResponse } from 'next/server';
import { checkDBConnection } from '@/lib/db';

export async function GET() {
  try {
    const dbConnected = await checkDBConnection();
    
    const status = {
      status: 'healthy',
      service: 'UmojaFund API',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      message: 'API is running',
      version: '1.0.0',
    };
    
    return NextResponse.json(status);
    
  } catch (error: any) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Health check failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}