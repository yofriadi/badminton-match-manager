-- Up Migration
CREATE TABLE tenant_players (
    id UUID DEFAULT uuidv7() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('man', 'woman')),
    skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'novice', 'intermediate', 'advanced', 'pro')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE TABLE hall_tenant_registered_players (
    hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tenant_player_id UUID NOT NULL REFERENCES tenant_players(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (hall_id, tenant_player_id)
);

-- Down Migration
DROP TABLE IF EXISTS hall_tenant_registered_players;
DROP TABLE IF EXISTS tenant_players;
