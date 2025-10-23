-- Up Migration
CREATE TABLE IF NOT EXISTS halls (
    id UUID DEFAULT uuidv7() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    layout JSONB NOT NULL,
    blueprint_svg TEXT NOT NULL,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    price_hourly INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Down Migration
DROP TABLE IF EXISTS halls;
