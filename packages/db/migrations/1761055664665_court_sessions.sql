-- Up Migration
CREATE TABLE IF NOT EXISTS court_sessions (
    id UUID DEFAULT uuidv7() PRIMARY KEY,
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    player_level_min TEXT NOT NULL CHECK (player_level_min IN ('beginner', 'novice', 'intermediate', 'advanced', 'pro')),
    player_level_max TEXT NOT NULL CHECK (player_level_max IN ('beginner', 'novice', 'intermediate', 'advanced', 'pro')),
    court_number TEXT NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 0,
    current_players INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (player_level_min <= player_level_max),
    CHECK (time_start < time_end),
    CHECK (current_players >= 0),
    CHECK (current_players <= max_players)
);

-- Indexes for better query performance
CREATE INDEX idx_court_sessions_schedule_id ON court_sessions(schedule_id);
CREATE INDEX idx_court_sessions_time ON court_sessions(time_start, time_end);
CREATE INDEX idx_court_sessions_player_level ON court_sessions(player_level_min, player_level_max);
CREATE INDEX idx_court_sessions_status ON court_sessions(status);
CREATE INDEX idx_court_sessions_court_number ON court_sessions(court_number);

-- Down Migration
DROP TABLE IF EXISTS court_sessions;