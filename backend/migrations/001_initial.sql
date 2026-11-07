CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY,
  campaign jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','queued','running','completed','failed')),
  stage text NOT NULL DEFAULT 'draft',
  image bytea,
  image_type text,
  reviews jsonb NOT NULL DEFAULT '[]',
  review_stats jsonb NOT NULL DEFAULT '{"received":0,"accepted":0,"duplicates":0}',
  outputs jsonb NOT NULL DEFAULT '{}',
  report jsonb,
  error jsonb,
  lease_token uuid,
  lease_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analyses_queue_idx ON analyses (created_at) WHERE status = 'queued';
