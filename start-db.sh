#!/bin/bash
# Start the local PostgreSQL cluster for jlpt-learning (runs as tw10569, no sudo needed)
PG_DATA="$HOME/pgdata-jlpt"
PG_CTL="/usr/lib/postgresql/18/bin/pg_ctl"

if $PG_CTL -D "$PG_DATA" status > /dev/null 2>&1; then
  echo "PostgreSQL already running on port 5433"
else
  $PG_CTL -D "$PG_DATA" -o "-p 5433 -k /tmp" -l "$PG_DATA/pg.log" start
  echo "PostgreSQL started on port 5433"
fi
