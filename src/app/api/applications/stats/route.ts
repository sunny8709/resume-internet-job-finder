import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications } from '@/db/schema';
import { sql, desc, eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function verifyAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return null;
  }
  return session.user;
}

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get current date and 7 days ago for recent applications
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoIso = sevenDaysAgo.toISOString();

    // Get total count for user
    const totalResult = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(applications)
      .where(eq(applications.userId, user.id));
    const total = totalResult[0]?.count || 0;

    // Get count by status for user
    const statusResult = await db.select({
      status: applications.status,
      count: sql<number>`count(*)`
    }).from(applications)
      .where(eq(applications.userId, user.id))
      .groupBy(applications.status);

    const byStatus = {
      success: 0,
      failed: 0,
      pending: 0
    };

    statusResult.forEach(row => {
      if (row.status === 'success') byStatus.success = row.count;
      else if (row.status === 'failed') byStatus.failed = row.count;
      else if (row.status === 'pending') byStatus.pending = row.count;
    });

    // Calculate success rate
    const totalCompleted = byStatus.success + byStatus.failed;
    const successRate = totalCompleted > 0 ? Math.round((byStatus.success / totalCompleted) * 100) : 0;

    // Get recent applications (last 7 days) for user
    const recentResult = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(applications)
      .where(and(
        eq(applications.userId, user.id),
        sql`${applications.createdAt} >= ${sevenDaysAgoIso}`
      ));
    const recent = recentResult[0]?.count || 0;

    // Get applications by company for user
    const companyResult = await db.select({
      company: applications.company,
      count: sql<number>`count(*)`
    }).from(applications)
      .where(and(
        eq(applications.userId, user.id),
        sql`${applications.company} IS NOT NULL AND ${applications.company} != ''`
      ))
      .groupBy(applications.company)
      .orderBy(desc(sql`count(*)`));

    const byCompany = companyResult.map(row => ({
      company: row.company || 'Unknown',
      count: row.count
    }));

    const statistics = {
      total,
      byStatus,
      successRate,
      recent,
      byCompany
    };

    return NextResponse.json(statistics, { status: 200 });

  } catch (error) {
    console.error('GET statistics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}