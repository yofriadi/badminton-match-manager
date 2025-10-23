-- Up Migration
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT uuidv7() PRIMARY KEY,
    hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    hall_name TEXT NOT NULL,
    price_per_person INTEGER NOT NULL,
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    player_level_min TEXT NOT NULL CHECK (player_level_min IN ('beginner', 'novice', 'intermediate', 'advanced', 'pro')),
    player_level_max TEXT NOT NULL CHECK (player_level_max IN ('beginner', 'novice', 'intermediate', 'advanced', 'pro')),
    court_numbers TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    max_players INTEGER NOT NULL DEFAULT 0,
    current_players INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (player_level_min <= player_level_max),
    CHECK (time_start < time_end),
    CHECK (current_players >= 0),
    CHECK (current_players <= max_players)
);

-- Indexes for better query performance
CREATE INDEX idx_schedules_hall_id ON schedules(hall_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_player_level ON schedules(player_level_min, player_level_max);
CREATE INDEX idx_schedules_tags ON schedules USING GIN(tags);

-- Down Migration
DROP TABLE IF EXISTS schedules;