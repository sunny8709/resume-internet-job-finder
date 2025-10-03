import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, jobs } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_STATUSES = ['success', 'failed', 'pending'] as const;
type ApplicationStatus = typeof VALID_STATUSES[number];

function isValidStatus(status: string): status is ApplicationStatus {
  return VALID_STATUSES.includes(status as ApplicationStatus);
}

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single application by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const application = await db.select()
        .from(applications)
        .where(and(
          eq(applications.id, parseInt(id)),
          eq(applications.userId, user.id)
        ))
        .limit(1);

      if (application.length === 0) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      return NextResponse.json(application[0]);
    }

    // List applications with pagination, search, and filtering - filtered by userId
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(applications).where(eq(applications.userId, user.id));
    
    const conditions = [eq(applications.userId, user.id)];

    // Search by jobTitle or company
    if (search) {
      conditions.push(
        or(
          like(applications.jobTitle, `%${search}%`),
          like(applications.company, `%${search}%`)
        )
      );
    }

    // Filter by status
    if (status && isValidStatus(status)) {
      conditions.push(eq(applications.status, status));
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = applications[sort as keyof typeof applications] || applications.createdAt;
    query = order === 'asc' 
      ? query.orderBy(sortColumn)
      : query.orderBy(desc(sortColumn));

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestBody = await request.json();
    const { jobId, jobTitle, company, status, appliedAt, website } = requestBody;

    // Validate required fields
    if (!jobId) {
      return NextResponse.json({ 
        error: "jobId is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ 
        error: "status is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate jobId is integer
    if (isNaN(parseInt(jobId.toString()))) {
      return NextResponse.json({ 
        error: "jobId must be a valid integer",
        code: "INVALID_JOB_ID" 
      }, { status: 400 });
    }

    // Validate status enum
    if (!isValidStatus(status)) {
      return NextResponse.json({ 
        error: "status must be one of: success, failed, pending",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate foreign key relationship - check if job exists and belongs to user
    const existingJob = await db.select()
      .from(jobs)
      .where(and(
        eq(jobs.id, parseInt(jobId.toString())),
        eq(jobs.userId, user.id)
      ))
      .limit(1);

    if (existingJob.length === 0) {
      return NextResponse.json({ 
        error: "Referenced job does not exist or does not belong to user",
        code: "INVALID_FOREIGN_KEY" 
      }, { status: 400 });
    }

    // Prepare insert data with auto-generated fields and userId
    const insertData = {
      userId: user.id,
      jobId: parseInt(jobId.toString()),
      jobTitle: jobTitle?.trim() || null,
      company: company?.trim() || null,
      status: status.trim(),
      appliedAt: appliedAt?.trim() || null,
      website: website?.trim() || null,
      createdAt: new Date().toISOString()
    };

    const newApplication = await db.insert(applications)
      .values(insertData)
      .returning();

    return NextResponse.json(newApplication[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { status } = requestBody;

    // Only allow updating status field
    if (Object.keys(requestBody).length !== 1 || !('status' in requestBody)) {
      return NextResponse.json({ 
        error: "Only status field can be updated",
        code: "INVALID_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ 
        error: "status is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate status enum
    if (!isValidStatus(status)) {
      return NextResponse.json({ 
        error: "status must be one of: success, failed, pending",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Check if application exists and belongs to user
    const existingApplication = await db.select()
      .from(applications)
      .where(and(
        eq(applications.id, parseInt(id)),
        eq(applications.userId, user.id)
      ))
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updated = await db.update(applications)
      .set({
        status: status.trim()
      })
      .where(and(
        eq(applications.id, parseInt(id)),
        eq(applications.userId, user.id)
      ))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if application exists and belongs to user
    const existingApplication = await db.select()
      .from(applications)
      .where(and(
        eq(applications.id, parseInt(id)),
        eq(applications.userId, user.id)
      ))
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const deleted = await db.delete(applications)
      .where(and(
        eq(applications.id, parseInt(id)),
        eq(applications.userId, user.id)
      ))
      .returning();

    return NextResponse.json({
      message: 'Application deleted successfully',
      deletedApplication: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}