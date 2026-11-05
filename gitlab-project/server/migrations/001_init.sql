-- Directory data: the application document split into parts (see src/shared/parts.ts).
-- doc is 'main' (staff) or 'vendors' (the vendors workspace).
CREATE TABLE IF NOT EXISTS doc_parts (
  doc        text        NOT NULL,
  part       text        NOT NULL,
  value      jsonb       NOT NULL,
  version    integer     NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text,
  PRIMARY KEY (doc, part)
);

-- Server-side change history: who changed which part, and when. Written only by the server.
CREATE TABLE IF NOT EXISTS change_log (
  id      bigserial   PRIMARY KEY,
  at      timestamptz NOT NULL DEFAULT now(),
  actor   text        NOT NULL,
  doc     text        NOT NULL,
  part    text        NOT NULL,
  action  text        NOT NULL,
  detail  jsonb
);
CREATE INDEX IF NOT EXISTS change_log_at ON change_log (at DESC);

-- The history can be added to but not edited or deleted, even by the application's own database user.
CREATE OR REPLACE FUNCTION change_log_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'change_log is append-only';
END $$;
DROP TRIGGER IF EXISTS change_log_no_update ON change_log;
CREATE TRIGGER change_log_no_update BEFORE UPDATE OR DELETE ON change_log FOR EACH ROW EXECUTE FUNCTION change_log_append_only();

-- Sign-in sessions (express-session via connect-pg-simple), shared by all replicas.
CREATE TABLE IF NOT EXISTS "session" (
  sid    varchar      NOT NULL PRIMARY KEY,
  sess   json         NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS session_expire ON "session" (expire);
