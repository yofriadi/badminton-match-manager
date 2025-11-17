-- Up Migration

-- Helper trigger function
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;


-- Enums (include 'unrated' as default baseline)
CREATE TYPE level  AS ENUM ('unrated','beginner','novice','intermediate','advanced','pro');
CREATE TYPE gender AS ENUM ('man','woman');


-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT uuidv7() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER tenants_set_updated
BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Halls
CREATE TABLE IF NOT EXISTS halls (
  id UUID DEFAULT uuidv7() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  layout JSONB NOT NULL,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER halls_set_updated
BEFORE UPDATE ON halls FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Courts
CREATE TABLE IF NOT EXISTS courts (
  id UUID DEFAULT uuidv7() PRIMARY KEY,
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  number INT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (hall_id, number),
  UNIQUE (hall_id, id)
);
CREATE INDEX IF NOT EXISTS idx_courts_hall ON courts(hall_id);


-- Tenant-scoped players
CREATE TABLE IF NOT EXISTS tenant_players (
  id UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender gender,
  skill_level level NOT NULL DEFAULT 'unrated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE (tenant_id, name),
  UNIQUE (tenant_id, id)
);
CREATE TRIGGER tenant_players_set_updated_at
BEFORE UPDATE ON tenant_players FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Registered players per hall (from a tenant's roster)
CREATE TABLE IF NOT EXISTS hall_tenant_registered_players (
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tenant_player_id UUID NOT NULL REFERENCES tenant_players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (hall_id, tenant_player_id),
  FOREIGN KEY (tenant_id, tenant_player_id)
    REFERENCES tenant_players(tenant_id, id) ON DELETE CASCADE
);
CREATE TRIGGER hall_tenant_registered_players_set_updated_at
BEFORE UPDATE ON hall_tenant_registered_players FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX IF NOT EXISTS idx_hall_reg_players_hall ON hall_tenant_registered_players(hall_id);


-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT uuidv7() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  price_per_person INTEGER NOT NULL CHECK (price_per_person >= 0),
  start_at TIMESTAMPTZ NOT NULL,
  end_at   TIMESTAMPTZ NOT NULL,
  player_level_min level NOT NULL,
  player_level_max level NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CHECK (player_level_min <= player_level_max),
  CHECK (start_at < end_at),
  UNIQUE (id, hall_id)
);
CREATE TRIGGER schedules_set_updated_at
BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_schedules_hall ON schedules(hall_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_at ON schedules(start_at);
CREATE INDEX IF NOT EXISTS idx_schedules_hall_time_range ON schedules(hall_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_schedules_level_range ON schedules(player_level_min, player_level_max);
CREATE INDEX IF NOT EXISTS idx_schedules_tags ON schedules USING GIN (tags);


-- Courts assigned to a schedule
CREATE TABLE IF NOT EXISTS schedule_courts (
  schedule_id UUID NOT NULL,
  hall_id     UUID NOT NULL,
  court_id    UUID NOT NULL,
  PRIMARY KEY (schedule_id, court_id),
  FOREIGN KEY (schedule_id, hall_id) REFERENCES schedules(id, hall_id) ON DELETE CASCADE,
  FOREIGN KEY (hall_id, court_id)    REFERENCES courts(hall_id, id)    ON DELETE RESTRICT
);


-- Court sessions (time slices per court)
CREATE TABLE IF NOT EXISTS court_sessions (
  id UUID DEFAULT uuidv7() PRIMARY KEY,
  schedule_id UUID NOT NULL,
  hall_id     UUID NOT NULL,
  court_id    UUID NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at   TIMESTAMPTZ NOT NULL,
  player_level_min level NOT NULL,
  player_level_max level NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  CHECK (start_at < end_at),
  CHECK (player_level_min <= player_level_max),
  FOREIGN KEY (schedule_id, hall_id) REFERENCES schedules(id, hall_id) ON DELETE CASCADE,
  FOREIGN KEY (hall_id, court_id)    REFERENCES courts(hall_id, id)    ON DELETE RESTRICT
);
CREATE TRIGGER court_sessions_set_updated_at
BEFORE UPDATE ON court_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_court_sessions_schedule ON court_sessions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_court_sessions_court ON court_sessions(court_id);
CREATE INDEX IF NOT EXISTS idx_court_sessions_schedule_time_range ON court_sessions(schedule_id, start_at, end_at);

-- Down Migration
DROP TABLE IF EXISTS tenants;
