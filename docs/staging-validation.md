# Digital Church OS Staging Validation Guide

This guide is the required production-proof path before merging or public release.

## 1. Confirm branch/source of truth

```bash
git fetch origin
git checkout production/ultra-route-hardening
git pull origin production/ultra-route-hardening
git rev-parse --abbrev-ref HEAD
```

Expected branch:

```text
production/ultra-route-hardening
```

## 2. Required staging environment

Create a real reachable PostgreSQL database using Neon, Supabase, Railway, Render, Vercel Postgres, or another managed provider.

Required minimum variables:

```bash
NEXTAUTH_SECRET="replace-with-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Optional/staging provider variables can be added later:

```bash
OPENAI_API_KEY=""
PINECONE_API_KEY=""
PINECONE_INDEX=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
RESEND_API_KEY=""
BLOB_READ_WRITE_TOKEN=""
SENTRY_DSN=""
```

## 3. Install and validate

```bash
npm ci
npx prisma generate
npx prisma validate
npm run lint
npm run build
```

Warnings are acceptable only if the build exits 0 and no runtime blocker is hidden.

## 4. Deploy migrations to real staging DB

```bash
npm run db:migrate:deploy
```

Do not mark staging as passed unless this succeeds against a real reachable PostgreSQL database.

## 5. Seed staging data

```bash
npm run db:seed:staging
```

This creates or updates minimal data for validation:

- Staging admin user
- Staging member user
- Christianity baseline
- AI module baseline
- Sermon/worship/conference records
- Phase 4-6 raw SQL records where tables exist
- Feature flags defaulted to disabled
- Media terms/provider defaults where available

Default accounts:

```text
admin@digitalchurchos.test
member@digitalchurchos.test
```

Default password:

```text
ChangeMe123!
```

Override with:

```bash
STAGING_ADMIN_EMAIL="..."
STAGING_MEMBER_EMAIL="..."
STAGING_SEED_PASSWORD="..."
```

## 6. Start app server

Development mode:

```bash
npm run dev
```

Production-like mode:

```bash
npm run build
npm run start
```

## 7. Run smoke test

In another terminal:

```bash
STAGING_BASE_URL="http://localhost:3000" npm run smoke:staging
```

Smoke-test status meanings:

- `PASS` = route returned 2xx.
- `PROTECTED_ROUTE_EXISTS` = route returned 401/403/redirect; this is expected for protected routes.
- `ROUTE_EXISTS_METHOD_NOT_ALLOWED` = route exists but GET is not supported.
- `MISSING_ROUTE` = route returned 404 and must be fixed.
- `RUNTIME_FAILURE` = route returned 5xx and must be fixed.
- `FETCH_FAILED` = app server is not reachable.

## 8. Open release readiness

Sign in as admin and open:

```text
/release-readiness
```

The release readiness API checks:

- Takedown holds
- Uncleared public media
- Open/high-priority content reports
- Pending media review
- Pending care escalations
- Pending aid requests
- Pending translations
- Pending testimony review
- Offline sync queue
- Command-center reports
- Enabled media providers
- Public rollout feature flags

## 9. Feature-flag policy

Keep these disabled until staging tests pass:

- `public_live_broadcasts`
- `public_worship_media`
- `marketplace_public_sales`
- `rewards_public_redemption`

Enable them gradually from `/release-readiness` and `/media-rights` workflows after validating safety and provider readiness.

## 10. Launch sign-off criteria

Do not merge or release publicly unless all are true:

- `npm run build` exits 0.
- `npm run db:migrate:deploy` succeeds on real staging DB.
- `npm run db:seed:staging` succeeds.
- App server starts.
- `npm run smoke:staging` has no `MISSING_ROUTE`, `RUNTIME_FAILURE`, or `FETCH_FAILED` results.
- `/release-readiness` shows no hard blockers.
- Public feature flags remain disabled until manual rollout approval.
- Media-rights/takedown workflow is tested.
- Payment/provider flows are tested or gated.

## 11. Production rollout order

1. Deploy staging.
2. Run migrations.
3. Seed staging.
4. Run smoke tests.
5. Test admin/member flows manually.
6. Run release readiness.
7. Fix blockers.
8. Merge to main.
9. Deploy production with flags disabled.
10. Enable public flags gradually.
