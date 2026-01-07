import { NextResponse } from 'next/server';

export async function GET() {
    const buildTime = new Date().toISOString();
    const buildId = process.env.BUILD_ID || 'BUILD_2026_01_07_15_00';

    return NextResponse.json({
        status: 'ok',
        buildId,
        buildTime,
        nodeVersion: process.version,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
}
