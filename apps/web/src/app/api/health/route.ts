import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'KYVON AI Operating System',
    version: '2.2.0',
    edge: true,
    timestamp: new Date().toISOString()
  });
}
