import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single job by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const job = await db.select()
        .from(jobs)
        .where(and(
          eq(jobs.id, parseInt(id)),
          eq(jobs.userId, user.id)
        ))
        .limit(1);

      if (job.length === 0) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      return NextResponse.json(job[0]);
    }

    // List jobs with pagination, search, and filtering - filtered by userId
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const type = searchParams.get('type');

    let query = db.select().from(jobs).where(eq(jobs.userId, user.id));
    const conditions = [eq(jobs.userId, user.id)];

    // Search by title or company
    if (search) {
      conditions.push(
        or(
          like(jobs.title, `%${search}%`),
          like(jobs.company, `%${search}%`)
        )
      );
    }

    // Filter by location
    if (location) {
      conditions.push(like(jobs.location, `%${location}%`));
    }

    // Filter by type
    if (type) {
      conditions.push(eq(jobs.type, type));
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

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
    
    // Check if it's a single job or bulk jobs
    const jobsData = Array.isArray(requestBody) ? requestBody : [requestBody];
    
    if (jobsData.length === 0) {
      return NextResponse.json({ 
        error: "At least one job is required",
        code: "EMPTY_JOBS_ARRAY" 
      }, { status: 400 });
    }

    // Validate each job
    const validatedJobs = [];
    for (let i = 0; i < jobsData.length; i++) {
      const job = jobsData[i];
      
      // Validate required fields
      if (!job.title || typeof job.title !== 'string' || job.title.trim().length === 0) {
        return NextResponse.json({ 
          error: `Job at index ${i}: Title is required and must be a non-empty string`,
          code: "MISSING_TITLE" 
        }, { status: 400 });
      }

      if (!job.company || typeof job.company !== 'string' || job.company.trim().length === 0) {
        return NextResponse.json({ 
          error: `Job at index ${i}: Company is required and must be a non-empty string`,
          code: "MISSING_COMPANY" 
        }, { status: 400 });
      }

      // Prepare validated job data with userId
      const validatedJob = {
        userId: user.id,
        title: job.title.trim(),
        company: job.company.trim(),
        location: job.location ? job.location.trim() : null,
        salary: job.salary ? job.salary.trim() : null,
        type: job.type ? job.type.trim() : null,
        description: job.description ? job.description.trim() : null,
        skills: job.skills || null,
        website: job.website ? job.website.trim().toLowerCase() : null,
        posted: job.posted ? job.posted.trim() : null,
        createdAt: new Date().toISOString()
      };

      validatedJobs.push(validatedJob);
    }

    // Bulk insert jobs
    const newJobs = await db.insert(jobs)
      .values(validatedJobs)
      .returning();

    return NextResponse.json(newJobs, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    
    // Check if record exists and belongs to user
    const existingJob = await db.select()
      .from(jobs)
      .where(and(
        eq(jobs.id, parseInt(id)),
        eq(jobs.userId, user.id)
      ))
      .limit(1);

    if (existingJob.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Validate fields if provided
    const updates: any = {};
    
    if (requestBody.title !== undefined) {
      if (!requestBody.title || typeof requestBody.title !== 'string' || requestBody.title.trim().length === 0) {
        return NextResponse.json({ 
          error: "Title must be a non-empty string",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = requestBody.title.trim();
    }

    if (requestBody.company !== undefined) {
      if (!requestBody.company || typeof requestBody.company !== 'string' || requestBody.company.trim().length === 0) {
        return NextResponse.json({ 
          error: "Company must be a non-empty string",
          code: "INVALID_COMPANY" 
        }, { status: 400 });
      }
      updates.company = requestBody.company.trim();
    }

    if (requestBody.location !== undefined) {
      updates.location = requestBody.location ? requestBody.location.trim() : null;
    }

    if (requestBody.salary !== undefined) {
      updates.salary = requestBody.salary ? requestBody.salary.trim() : null;
    }

    if (requestBody.type !== undefined) {
      updates.type = requestBody.type ? requestBody.type.trim() : null;
    }

    if (requestBody.description !== undefined) {
      updates.description = requestBody.description ? requestBody.description.trim() : null;
    }

    if (requestBody.skills !== undefined) {
      updates.skills = requestBody.skills || null;
    }

    if (requestBody.website !== undefined) {
      updates.website = requestBody.website ? requestBody.website.trim().toLowerCase() : null;
    }

    if (requestBody.posted !== undefined) {
      updates.posted = requestBody.posted ? requestBody.posted.trim() : null;
    }

    const updatedJob = await db.update(jobs)
      .set(updates)
      .where(and(
        eq(jobs.id, parseInt(id)),
        eq(jobs.userId, user.id)
      ))
      .returning();

    if (updatedJob.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(updatedJob[0]);
  } catch (error) {
    console.error('PUT error:', error);
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

    // Check if record exists and belongs to user
    const existingJob = await db.select()
      .from(jobs)
      .where(and(
        eq(jobs.id, parseInt(id)),
        eq(jobs.userId, user.id)
      ))
      .limit(1);

    if (existingJob.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const deletedJob = await db.delete(jobs)
      .where(and(
        eq(jobs.id, parseInt(id)),
        eq(jobs.userId, user.id)
      ))
      .returning();

    if (deletedJob.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Job deleted successfully',
      deletedJob: deletedJob[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}