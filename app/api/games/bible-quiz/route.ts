import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const GameSchema = z.object({
  title: z.string().trim().min(3).max(160),
  ageGroup: z.enum(['CHILDREN', 'YOUTH', 'FAMILY', 'ADULT']).default('YOUTH'),
  topic: z.string().trim().min(2).max(120),
  points: z.coerce.number().int().min(0).max(5000).default(20),
  questions: z.array(z.object({
    question: z.string().trim().min(3),
    options: z.array(z.string().trim()).min(2).max(6),
    answer: z.string().trim(),
    verse: z.string().trim().optional(),
    explanation: z.string().trim().optional(),
  })).min(1).max(50),
});

const AttemptSchema = z.object({
  gameId: z.string().trim().min(3),
  childId: z.string().trim().optional(),
  answers: z.record(z.any()),
});

function scoreAttempt(questions: any[], answers: Record<string, any>) {
  let score = 0;
  questions.forEach((q, index) => {
    const key = String(index);
    if (String(answers[key] || '').trim().toLowerCase() === String(q.answer || '').trim().toLowerCase()) score += 1;
  });
  return score;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const action = body.action || 'attempt';

  if (action === 'create') {
    if (session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    const parsed = GameSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid quiz game payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO bible_quiz_games (title, age_group, topic, questions, points, created_by, active)
      VALUES (${d.title}, ${d.ageGroup}, ${d.topic}, ${JSON.stringify(d.questions)}::jsonb, ${d.points}, ${session.user.id}, true)
      RETURNING id, title, age_group, topic, points, active, created_at
    `);
    return NextResponse.json({ game: rows[0] }, { status: 201 });
  }

  const parsed = AttemptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid quiz attempt payload', details: parsed.error.flatten() }, { status: 400 });
  const games = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM bible_quiz_games WHERE id = ${parsed.data.gameId} AND active = true LIMIT 1`);
  const game = games[0];
  if (!game) return NextResponse.json({ error: 'Quiz game not found' }, { status: 404 });

  const questions = Array.isArray(game.questions) ? game.questions : [];
  const score = scoreAttempt(questions, parsed.data.answers);
  const maxScore = questions.length;
  const pointsAwarded = maxScore > 0 ? Math.round((score / maxScore) * Number(game.points || 0)) : 0;

  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO bible_quiz_attempts (game_id, user_id, child_id, score, max_score, answers, points_awarded)
    VALUES (${game.id}, ${session.user.id}, ${parsed.data.childId || null}, ${score}, ${maxScore}, ${JSON.stringify(parsed.data.answers)}::jsonb, ${pointsAwarded})
    RETURNING *
  `);

  if (pointsAwarded > 0) {
    const wallet = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO kingdom_wallets (user_id) VALUES (${session.user.id})
      ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
      RETURNING id
    `);
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO kingdom_wallet_ledger (wallet_id, user_id, entry_type, source_type, source_id, points_delta, description)
      VALUES (${wallet[0].id}, ${session.user.id}, 'QUIZ_REWARD', 'bible_quiz_game', ${game.id}, ${pointsAwarded}, ${`Bible quiz completed: ${game.title}`})
    `);
    await prisma.$executeRaw(Prisma.sql`UPDATE kingdom_wallets SET points_balance = points_balance + ${pointsAwarded}, updated_at = now() WHERE id = ${wallet[0].id}`);
  }

  return NextResponse.json({ attempt: rows[0], score, maxScore, pointsAwarded }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ageGroup = searchParams.get('ageGroup');
  const games = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, title, age_group, topic, points, active, created_at
    FROM bible_quiz_games
    WHERE active = true AND (${ageGroup || null}::text IS NULL OR age_group = ${ageGroup || null})
    ORDER BY created_at DESC
    LIMIT 100
  `);
  return NextResponse.json({ games });
}
