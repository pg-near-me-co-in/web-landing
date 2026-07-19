// Seed: top 5 states × top 5 cities, areas for launched metros, amenities,
// demo listings + reviews (source=admin_manual / imported — replace with real data).
const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.ggaxffyliyblgqqpapcn',
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

// ---- top 5 states, top 5 cities each (launched = biggest PG markets) ------
const STATES = {
  Karnataka: [
    ['Bengaluru', 'bengaluru', 12.9716, 77.5946, true],
    ['Mysuru', 'mysuru', 12.2958, 76.6394, false],
    ['Mangaluru', 'mangaluru', 12.9141, 74.856, false],
    ['Hubballi', 'hubballi', 15.3647, 75.124, false],
    ['Belagavi', 'belagavi', 15.8497, 74.4977, false],
  ],
  Maharashtra: [
    ['Mumbai', 'mumbai', 19.076, 72.8777, true],
    ['Pune', 'pune', 18.5204, 73.8567, true],
    ['Nagpur', 'nagpur', 21.1458, 79.0882, false],
    ['Nashik', 'nashik', 19.9975, 73.7898, false],
    ['Chhatrapati Sambhajinagar', 'chhatrapati-sambhajinagar', 19.8762, 75.3433, false],
  ],
  'Tamil Nadu': [
    ['Chennai', 'chennai', 13.0827, 80.2707, true],
    ['Coimbatore', 'coimbatore', 11.0168, 76.9558, false],
    ['Madurai', 'madurai', 9.9252, 78.1198, false],
    ['Tiruchirappalli', 'tiruchirappalli', 10.7905, 78.7047, false],
    ['Salem', 'salem', 11.6643, 78.146, false],
  ],
  Telangana: [
    ['Hyderabad', 'hyderabad', 17.385, 78.4867, true],
    ['Warangal', 'warangal', 17.9689, 79.5941, false],
    ['Karimnagar', 'karimnagar', 18.4386, 79.1288, false],
    ['Nizamabad', 'nizamabad', 18.6725, 78.0941, false],
    ['Khammam', 'khammam', 17.2473, 80.1514, false],
  ],
  'Delhi NCR': [
    ['Delhi', 'delhi', 28.6139, 77.209, true],
    ['Noida', 'noida', 28.5355, 77.391, false],
    ['Gurugram', 'gurugram', 28.4595, 77.0266, false],
    ['Ghaziabad', 'ghaziabad', 28.6692, 77.4538, false],
    ['Faridabad', 'faridabad', 28.4089, 77.3178, false],
  ],
};

const AREAS = {
  bengaluru: [
    ['Koramangala', 12.9352, 77.6245], ['HSR Layout', 12.9116, 77.6474],
    ['Whitefield', 12.9698, 77.75], ['Marathahalli', 12.9569, 77.7011],
    ['BTM Layout', 12.9166, 77.6101], ['Electronic City', 12.8452, 77.6602],
  ],
  mumbai: [
    ['Andheri West', 19.1364, 72.8296], ['Powai', 19.1176, 72.906],
    ['Malad West', 19.1874, 72.8484], ['Borivali West', 19.2307, 72.8567],
    ['Dadar', 19.0178, 72.8478],
  ],
  pune: [
    ['Kothrud', 18.5074, 73.8077], ['Hinjewadi', 18.5913, 73.7389],
    ['Viman Nagar', 18.5679, 73.9143], ['Wakad', 18.5975, 73.7898],
    ['Kharadi', 18.5515, 73.9414],
  ],
  chennai: [
    ['Velachery', 12.9791, 80.2212], ['Sholinganallur', 12.901, 80.2279],
    ['T. Nagar', 13.0418, 80.2341], ['Adyar', 13.0067, 80.257],
    ['Porur', 13.0382, 80.1565],
  ],
  hyderabad: [
    ['Madhapur', 17.4483, 78.3915], ['Gachibowli', 17.4401, 78.3489],
    ['Kondapur', 17.4585, 78.3574], ['Ameerpet', 17.4375, 78.4483],
    ['Kukatpally', 17.4849, 78.4138],
  ],
  delhi: [
    ['Laxmi Nagar', 28.6304, 77.2777], ['Karol Bagh', 28.6519, 77.1909],
    ['Mukherjee Nagar', 28.7158, 77.211], ['Saket', 28.5245, 77.2066],
    ['Rajouri Garden', 28.6425, 77.1225],
  ],
};

const AMENITIES = [
  ['WiFi', 'wifi', 'wifi', 'comfort'], ['AC', 'ac', 'snowflake', 'comfort'],
  ['Food Included', 'food-included', 'utensils', 'food'],
  ['Laundry', 'laundry', 'shirt', 'comfort'],
  ['Power Backup', 'power-backup', 'zap', 'comfort'],
  ['Housekeeping', 'housekeeping', 'broom', 'comfort'],
  ['CCTV', 'cctv', 'camera', 'safety'], ['Parking', 'parking', 'car', 'comfort'],
  ['Hot Water', 'hot-water', 'droplet', 'comfort'],
  ['Fridge', 'fridge', 'fridge', 'comfort'],
  ['Washing Machine', 'washing-machine', 'washer', 'comfort'],
  ['Attached Bathroom', 'attached-bathroom', 'bath', 'comfort'],
  ['Security Guard', 'security-guard', 'shield', 'safety'],
  ['TV Lounge', 'tv-lounge', 'tv', 'comfort'], ['Lift', 'lift', 'elevator', 'comfort'],
  ['Gym', 'gym', 'dumbbell', 'comfort'],
];

// demo listing name parts — clearly seed data, replaced by real submissions
const NAME_A = ['Sunrise', 'Comfort Nest', 'Urban Stay', 'GreenLeaf', 'Shanti', 'Skyline', 'Happy Home', 'Lakeview', 'Maple', 'Anand'];
const NAME_B = { male: "Gents PG", female: "Ladies PG", unisex: 'Co-living PG' };
const IMGS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&q=80',
];
const REVIEWERS = ['Rahul S.', 'Priya M.', 'Aditya K.', 'Sneha R.', 'Vikram T.', 'Ananya G.', 'Rohan D.', 'Kavya N.'];
const REVIEW_TEXTS = [
  'Clean rooms and the food is decent. Owner is responsive.',
  'Good location, walkable to the metro. WiFi could be faster.',
  'Stayed 8 months — safe and well maintained. Recommended.',
  'Value for money. Housekeeping comes daily.',
  'Strict but fair house rules. Great for working professionals.',
  'Spacious rooms, power backup works. Food is average.',
];

const rnd = (arr, i) => arr[i % arr.length];

async function main() {
  await client.connect();
  await client.query('begin');

  // cities
  const citySlugToId = {};
  for (const [state, cities] of Object.entries(STATES)) {
    for (const [name, slug, lat, lng, launched] of cities) {
      const r = await client.query(
        `insert into cities (name, slug, state, lat, lng, is_launched)
         values ($1,$2,$3,$4,$5,$6)
         on conflict (slug) do update set state=excluded.state
         returning id`,
        [name, slug, state, lat, lng, launched]
      );
      citySlugToId[slug] = r.rows[0].id;
    }
  }

  // areas
  const areaIds = {}; // citySlug -> [{id,name,slug,lat,lng}]
  for (const [citySlug, areas] of Object.entries(AREAS)) {
    areaIds[citySlug] = [];
    for (const [name, lat, lng] of areas) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const r = await client.query(
        `insert into areas (city_id, name, slug, lat, lng)
         values ($1,$2,$3,$4,$5)
         on conflict (city_id, slug) do update set name=excluded.name
         returning id, slug`,
        [citySlugToId[citySlug], name, slug, lat, lng]
      );
      areaIds[citySlug].push({ id: r.rows[0].id, name, slug, lat, lng });
    }
  }

  // amenities
  const amenityIds = [];
  for (const [name, slug, icon, cat] of AMENITIES) {
    const r = await client.query(
      `insert into amenities (name, slug, icon_key, category)
       values ($1,$2,$3,$4)
       on conflict (slug) do update set name=excluded.name
       returning id`,
      [name, slug, icon, cat]
    );
    amenityIds.push(r.rows[0].id);
  }

  // site_settings theme seed (Figma palette per DESIGN_SYSTEM.md)
  const settings = {
    'theme.primary_color': '#534AB7',
    'theme.purple': '#7F77DD',
    'theme.accent': '#AFA9EC',
    'theme.teal': '#1D9E75',
    'theme.highlight': '#5DCAA5',
    'theme.font_heading': 'Cherry Bomb One',
    'theme.font_body': 'Manrope',
    'site.name': 'PG Near Me',
    'site.domain': 'pgnearme.co.in',
  };
  for (const [key, value] of Object.entries(settings)) {
    await client.query(
      `insert into site_settings (key, value) values ($1, to_jsonb($2::text))
       on conflict (key) do update set value = excluded.value`,
      [key, value]
    );
  }

  await client.query('commit');
  console.log('seeded cities/areas/amenities/settings');
  await client.end();
}
main().catch(async (e) => { console.error('ERROR:', e.message); process.exit(1); });
