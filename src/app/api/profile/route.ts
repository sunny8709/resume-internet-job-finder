import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfile } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
    const profile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile[0]);
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
    const { email, phone, linkedin, coverLetter } = requestBody;

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Check if profile already exists for this user
    const existingProfile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id))
      .limit(1);

    const now = new Date().toISOString();

    if (existingProfile.length > 0) {
      // Update existing profile
      const updated = await db.update(userProfile)
        .set({
          email: email || existingProfile[0].email,
          phone: phone || existingProfile[0].phone,
          linkedin: linkedin || existingProfile[0].linkedin,
          coverLetter: coverLetter || existingProfile[0].coverLetter,
          updatedAt: now
        })
        .where(eq(userProfile.userId, user.id))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new profile with userId
      const newProfile = await db.insert(userProfile)
        .values({
          userId: user.id,
          email: email || null,
          phone: phone || null,
          linkedin: linkedin || null,
          coverLetter: coverLetter || null,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      return NextResponse.json(newProfile[0], { status: 201 });
    }
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
    const requestBody = await request.json();
    const { email, phone, linkedin, coverLetter } = requestBody;

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Check if profile already exists for this user
    const existingProfile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, user.id))
      .limit(1);

    const now = new Date().toISOString();

    if (existingProfile.length > 0) {
      // Update existing profile
      const updateData: any = { updatedAt: now };
      
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (linkedin !== undefined) updateData.linkedin = linkedin;
      if (coverLetter !== undefined) updateData.coverLetter = coverLetter;

      const updated = await db.update(userProfile)
        .set(updateData)
        .where(eq(userProfile.userId, user.id))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new profile with userId
      const newProfile = await db.insert(userProfile)
        .values({
          userId: user.id,
          email: email || null,
          phone: phone || null,
          linkedin: linkedin || null,
          coverLetter: coverLetter || null,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      return NextResponse.json(newProfile[0], { status: 201 });
    }
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}