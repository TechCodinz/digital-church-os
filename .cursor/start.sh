#!/usr/bin/env bash
# Per-boot startup for Digital Church OS Cloud Agents.
#
# Ensures the local PostgreSQL cluster is running (and the role/database exist)
# every time the environment starts, then returns. The Next.js dev server is
# launched separately as a visible terminal so its logs stay inspectable.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

bash .cursor/postgres.sh ensure

echo "[start] PostgreSQL is up; Digital Church OS is ready. Run 'npm run dev' or use the dev-server terminal."
