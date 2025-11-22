ALTER TABLE "court_sessions" ADD COLUMN "players" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "court_sessions" ADD COLUMN "type" text;
ALTER TABLE "court_sessions" ADD COLUMN "game_number" integer;
