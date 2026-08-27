import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ctoai.reiwasakura.tech/v1/chat/completions';

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kyvon-Gateway': 'vercel-edge'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EDGE_GATEWAY_ERROR',
          message: err?.message || 'Failed to reach AI inference core'
        }
      },
      { status: 502 }
    );
  }
}
