INSERT OR IGNORE INTO court_halls (id, hall_id, number, is_enabled)
VALUES
  -- Pasar Tebet Sport Center (available courts: 9-11; 12-15 unavailable per layout)
  ('pasar-tebet-sport-center-c9',  'pasar-tebet-sport-center', 9,  1),
  ('pasar-tebet-sport-center-c10', 'pasar-tebet-sport-center', 10, 1),
  ('pasar-tebet-sport-center-c11', 'pasar-tebet-sport-center', 11, 1),
  ('pasar-tebet-sport-center-c12', 'pasar-tebet-sport-center', 12, 0),
  ('pasar-tebet-sport-center-c13', 'pasar-tebet-sport-center', 13, 0),
  ('pasar-tebet-sport-center-c14', 'pasar-tebet-sport-center', 14, 0),
  ('pasar-tebet-sport-center-c15', 'pasar-tebet-sport-center', 15, 0),
  -- JiFi Arena Badminton (court 1 unavailable per layout)
  ('jifi-arena-badminton-c1', 'jifi-arena-badminton', 1, 0),
  ('jifi-arena-badminton-c2', 'jifi-arena-badminton', 2, 1),
  ('jifi-arena-badminton-c3', 'jifi-arena-badminton', 3, 1),
  -- Mustika Badminton Arena (4 courts; layout labels A-D, stored as numbers 1-4)
  ('mustika-badminton-arena-c1', 'mustika-badminton-arena', 1, 1),
  ('mustika-badminton-arena-c2', 'mustika-badminton-arena', 2, 1),
  ('mustika-badminton-arena-c3', 'mustika-badminton-arena', 3, 1),
  ('mustika-badminton-arena-c4', 'mustika-badminton-arena', 4, 1),
  -- Gor Badminton PBAU (3 courts)
  ('gor-badminton-pbau-c1', 'gor-badminton-pbau', 1, 1),
  ('gor-badminton-pbau-c2', 'gor-badminton-pbau', 2, 1),
  ('gor-badminton-pbau-c3', 'gor-badminton-pbau', 3, 1);
