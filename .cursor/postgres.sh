#!/usr/bin/env bash
# Manage the local PostgreSQL cluster used for Digital Church OS development.
#
#   postgres.sh ensure   -> install (if missing), start, and provision role + database (idempotent)
#   postgres.sh start    -> start the cluster and wait for readiness (idempotent)
#
# Runs without systemd by driving pg_ctlcluster directly, which is required
# inside Cloud Agent VMs.
set -euo pipefail

PG_VERSION="${PG_VERSION:-16}"
PG_CLUSTER="${PG_CLUSTER:-main}"
DB_NAME="${DB_NAME:-digital_church_os}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-password}"

log() { echo "[postgres] $*"; }

install_postgres() {
  if command -v pg_ctlcluster >/dev/null 2>&1; then
    return 0
  fi
  log "PostgreSQL not found; installing via apt..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
}

is_ready() {
  sudo -u postgres pg_isready -q 2>/dev/null
}

start_cluster() {
  if is_ready; then
    log "cluster already running"
    return 0
  fi
  log "starting cluster ${PG_VERSION}/${PG_CLUSTER}"
  sudo pg_ctlcluster "$PG_VERSION" "$PG_CLUSTER" start 2>/dev/null \
    || sudo pg_ctlcluster "$PG_VERSION" "$PG_CLUSTER" restart
}

wait_ready() {
  for _ in $(seq 1 30); do
    if is_ready; then
      return 0
    fi
    sleep 1
  done
  log "ERROR: PostgreSQL did not become ready in time" >&2
  return 1
}

provision() {
  # Idempotent: align the postgres role password and ensure the app database exists.
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" >/dev/null
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    log "creating database ${DB_NAME}"
    sudo -u postgres createdb "$DB_NAME"
  fi
}

case "${1:-ensure}" in
  ensure)
    install_postgres
    start_cluster
    wait_ready
    provision
    log "ready (database=${DB_NAME})"
    ;;
  start)
    start_cluster
    wait_ready
    log "ready (database=${DB_NAME})"
    ;;
  *)
    echo "usage: $0 [ensure|start]" >&2
    exit 1
    ;;
esac
