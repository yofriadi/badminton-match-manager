-- Up Migration

-- Insert hall records with layout+amenities payloads
INSERT INTO halls (name, address, description, layout, amenities)
VALUES
  (
    'Pasar Tebet Sport Center',
    'Jl. Tebet Barat Dalam Raya No. 12, Tebet, Jakarta Selatan',
    'A community-driven complex with well-maintained courts suitable for casual games, leagues, and private coaching sessions.',
    $${
      "padding": 32,
      "courtSize": { "width": 133, "height": 200 },
      "spacing": { "row": 36, "court": 18 },
      "rows": [
        {
          "number": 1,
          "orientation": "horizontal",
          "courts": [
            { "label": "14", "isAvailable": false },
            { "label": "15", "isAvailable": false }
          ]
        },
        {
          "number": 2,
          "orientation": "vertical",
          "courts": [
            { "label": "9" },
            { "label": "10" },
            { "label": "11" },
            { "label": "12", "isAvailable": false },
            { "label": "13", "isAvailable": false }
          ]
        }
      ]
    }$$::jsonb,
    '["Equipment rental","Locker room & showers","On-site cafe","Dedicated parking"]'::jsonb
  ),
  (
    'JiFi Arena Badminton',
    'Jl. Kemang Raya No. 45, Mampang Prapatan, Jakarta Selatan',
    'Modern indoor arena offering tournament-grade lighting and flooring, favored by intermediate and advanced players.',
    $${
      "padding": 32,
      "courtSize": { "width": 133, "height": 200 },
      "spacing": { "row": 36, "court": 18 },
      "rows": [
        {
          "number": 1,
          "orientation": "vertical",
          "courts": [
            { "label": "1", "isAvailable": false },
            { "label": "2" },
            { "label": "3" }
          ]
        }
      ]
    }$$::jsonb,
    '["Professional coaching","Stringing service","Pro shop","Cafeteria"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Down Migration
DELETE FROM halls;

