import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        // Log upload for audit
        await prisma.auditLog.create({
            data: {
                actorId: session.user.id,
                action: 'UPLOAD',
                entityType: 'File',
                metadata: {
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                    url: blob.url,
                },
            },
        });

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
