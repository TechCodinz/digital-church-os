import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown) {
  console.error('Error:', error);

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'Unique constraint violation', code: error.code },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found', code: error.code },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { error: 'Database error', code: error.code },
          { status: 500 }
        );
    }
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Default error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
