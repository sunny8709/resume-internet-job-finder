import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumes } from '@/db/schema';
import { eq, like, desc, and } from 'drizzle-orm';
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

    // Single resume by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const resume = await db.select()
        .from(resumes)
        .where(and(
          eq(resumes.id, parseInt(id)),
          eq(resumes.userId, user.id)
        ))
        .limit(1);

      if (resume.length === 0) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      return NextResponse.json(resume[0]);
    }

    // List resumes with pagination and search - filtered by userId
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(resumes).where(eq(resumes.userId, user.id));

    if (search) {
      query = query.where(and(
        eq(resumes.userId, user.id),
        like(resumes.fileName, `%${search}%`)
      ));
    }

    const results = await query
      .orderBy(desc(resumes.createdAt))
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
    const { resumeText, skills, fileName, fileSize, fileType } = requestBody;

    // Validate required fields
    if (!fileName) {
      return NextResponse.json({
        error: "fileName is required",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    // Sanitize inputs and automatically set userId
    const sanitizedData = {
      userId: user.id,
      resumeText: resumeText ? resumeText.toString().trim() : null,
      skills: skills || [],
      fileName: fileName.toString().trim(),
      fileSize: fileSize ? parseInt(fileSize) : null,
      fileType: fileType ? fileType.toString().trim() : null,
      createdAt: new Date().toISOString()
    };

    const newResume = await db.insert(resumes)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newResume[0], { status: 201 });

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
    const { resumeText, skills, fileName, fileSize, fileType } = requestBody;

    // Check if record exists and belongs to user
    const existingResume = await db.select()
      .from(resumes)
      .where(and(
        eq(resumes.id, parseInt(id)),
        eq(resumes.userId, user.id)
      ))
      .limit(1);

    if (existingResume.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (resumeText !== undefined) {
      updateData.resumeText = resumeText ? resumeText.toString().trim() : null;
    }
    if (skills !== undefined) {
      updateData.skills = skills;
    }
    if (fileName !== undefined) {
      if (!fileName) {
        return NextResponse.json({
          error: "fileName cannot be empty",
          code: "INVALID_FIELD"
        }, { status: 400 });
      }
      updateData.fileName = fileName.toString().trim();
    }
    if (fileSize !== undefined) {
      updateData.fileSize = fileSize ? parseInt(fileSize) : null;
    }
    if (fileType !== undefined) {
      updateData.fileType = fileType ? fileType.toString().trim() : null;
    }

    const updated = await db.update(resumes)
      .set(updateData)
      .where(and(
        eq(resumes.id, parseInt(id)),
        eq(resumes.userId, user.id)
      ))
      .returning();

    return NextResponse.json(updated[0]);

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
    const existingResume = await db.select()
      .from(resumes)
      .where(and(
        eq(resumes.id, parseInt(id)),
        eq(resumes.userId, user.id)
      ))
      .limit(1);

    if (existingResume.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const deleted = await db.delete(resumes)
      .where(and(
        eq(resumes.id, parseInt(id)),
        eq(resumes.userId, user.id)
      ))
      .returning();

    return NextResponse.json({
      message: 'Resume deleted successfully',
      deletedResume: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}