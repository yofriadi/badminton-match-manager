INSERT INTO halls (
  id,
  name,
  address,
  description,
  price_range,
  layout,
  amenities,
  created_at,
  updated_at
)
VALUES
  (
    'pasar-tebet-sport-center',
    'Pasar Tebet Sport Center',
    'Jl. Tebet Barat Dalam Raya No. 12, Tebet, Jakarta Selatan',
    'A community-driven complex with well-maintained courts suitable for casual games, leagues, and private coaching sessions.',
    '50000-100000',
    '{"padding":32,"courtSize":{"width":133,"height":200},"spacing":{"row":36,"court":18},"rows":[{"number":1,"orientation":"horizontal","courts":[{"label":"14","isAvailable":false},{"label":"15","isAvailable":false}]},{"number":2,"orientation":"vertical","courts":[{"label":"9"},{"label":"10"},{"label":"11"},{"label":"12","isAvailable":false},{"label":"13","isAvailable":false}]}]}',
    '["Equipment rental","Locker room & showers","On-site cafe","Dedicated parking"]',
    unixepoch() * 1000,
    unixepoch() * 1000
  ),
  (
    'jifi-arena-badminton',
    'JiFi Arena Badminton',
    'Jl. Kemang Raya No. 45, Mampang Prapatan, Jakarta Selatan',
    'Modern indoor arena offering tournament-grade lighting and flooring, favored by intermediate and advanced players.',
    '75000-150000',
    '{"padding":32,"courtSize":{"width":133,"height":200},"spacing":{"row":36,"court":18},"rows":[{"number":1,"orientation":"vertical","courts":[{"label":"1","isAvailable":false},{"label":"2"},{"label":"3"}]}]}',
    '["Professional coaching","Stringing service","Pro shop","Cafeteria"]',
    unixepoch() * 1000,
    unixepoch() * 1000
  ),
  (
    'mustika-badminton-arena',
    'Mustika Badminton Arena',
    'Sdn Jatinegara 03-04 Pagi, Jl. Puskesmas No.9, RT.6/RW.3, Jatinegara, Kec. Cakung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13930, Indonesia',
    'A friendly neighborhood badminton arena with well-maintained courts for players of all levels.',
    '50000-90000',
    '{"padding":32,"courtSize":{"width":133,"height":200},"spacing":{"row":36,"court":18},"rows":[{"number":1,"orientation":"vertical","courts":[{"label":"A"},{"label":"B"},{"label":"C"},{"label":"D"}]}]}',
    '["Locker room & showers","On-site cafe"]',
    unixepoch() * 1000,
    unixepoch() * 1000
  ),
  (
    'gor-badminton-pbau',
    'Gor Badminton PBAU',
    'Jl. Di Panjaitan No.Kav.24, RT.13/RW.3, Cipinang Cempedak, Kecamatan Jatinegara, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13340, Indonesia',
    'A spacious badminton hall offering quality courts for training sessions and recreational play.',
    '70000-100000',
    '{"padding":32,"courtSize":{"width":133,"height":200},"spacing":{"row":36,"court":18},"rows":[{"number":1,"orientation":"vertical","courts":[{"label":"1"},{"label":"2"},{"label":"3"}]}]}',
    '["Locker room & showers"]',
    unixepoch() * 1000,
    unixepoch() * 1000
  )
;
