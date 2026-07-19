// Expansion: remaining major Indian states, top 5 cities each.
// Biggest PG/student market per state is launched (gets OSM data).
const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.ggaxffyliyblgqqpapcn',
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const STATES = {
  Gujarat: [
    ['Ahmedabad', 23.0225, 72.5714, true],
    ['Surat', 21.1702, 72.8311, false],
    ['Vadodara', 22.3072, 73.1812, false],
    ['Rajkot', 22.3039, 70.8022, false],
    ['Gandhinagar', 23.2156, 72.6369, false],
  ],
  Rajasthan: [
    ['Jaipur', 26.9124, 75.7873, true],
    ['Kota', 25.2138, 75.8648, true], // exam-prep hub, year-round PG demand
    ['Jodhpur', 26.2389, 73.0243, false],
    ['Udaipur', 24.5854, 73.7125, false],
    ['Ajmer', 26.4499, 74.6399, false],
  ],
  'Uttar Pradesh': [
    ['Lucknow', 26.8467, 80.9462, true],
    ['Kanpur', 26.4499, 80.3319, false],
    ['Varanasi', 25.3176, 82.9739, false],
    ['Prayagraj', 25.4358, 81.8463, false],
    ['Agra', 27.1767, 78.0081, false],
  ],
  'Madhya Pradesh': [
    ['Indore', 22.7196, 75.8577, true],
    ['Bhopal', 23.2599, 77.4126, false],
    ['Jabalpur', 23.1815, 79.9864, false],
    ['Gwalior', 26.2183, 78.1828, false],
    ['Ujjain', 23.1793, 75.7849, false],
  ],
  'West Bengal': [
    ['Kolkata', 22.5726, 88.3639, true],
    ['Howrah', 22.5958, 88.2636, false],
    ['Durgapur', 23.5204, 87.3119, false],
    ['Siliguri', 26.7271, 88.3953, false],
    ['Asansol', 23.6739, 86.9524, false],
  ],
  Kerala: [
    ['Kochi', 9.9312, 76.2673, true],
    ['Thiruvananthapuram', 8.5241, 76.9366, false],
    ['Kozhikode', 11.2588, 75.7804, false],
    ['Thrissur', 10.5276, 76.2144, false],
    ['Kollam', 8.8932, 76.6141, false],
  ],
  'Andhra Pradesh': [
    ['Visakhapatnam', 17.6868, 83.2185, true],
    ['Vijayawada', 16.5062, 80.648, false],
    ['Guntur', 16.3067, 80.4365, false],
    ['Tirupati', 13.6288, 79.4192, false],
    ['Nellore', 14.4426, 79.9865, false],
  ],
  Punjab: [
    ['Ludhiana', 30.901, 75.8573, true],
    ['Amritsar', 31.634, 74.8723, false],
    ['Jalandhar', 31.326, 75.5762, false],
    ['Patiala', 30.3398, 76.3869, false],
    ['Mohali', 30.7046, 76.7179, false],
  ],
  Haryana: [
    ['Rohtak', 28.8955, 76.6066, false],
    ['Panipat', 29.3909, 76.9635, false],
    ['Karnal', 29.6857, 76.9905, false],
    ['Hisar', 29.1492, 75.7217, false],
    ['Ambala', 30.3752, 76.7821, false],
  ],
  Bihar: [
    ['Patna', 25.5941, 85.1376, true],
    ['Gaya', 24.7914, 85.0002, false],
    ['Muzaffarpur', 26.1197, 85.391, false],
    ['Bhagalpur', 25.2425, 86.9842, false],
    ['Darbhanga', 26.1542, 85.8918, false],
  ],
  Odisha: [
    ['Bhubaneswar', 20.2961, 85.8245, true],
    ['Cuttack', 20.4625, 85.883, false],
    ['Rourkela', 22.2604, 84.8536, false],
    ['Berhampur', 19.3149, 84.7941, false],
    ['Sambalpur', 21.4669, 83.9812, false],
  ],
  Jharkhand: [
    ['Ranchi', 23.3441, 85.3096, true],
    ['Jamshedpur', 22.8046, 86.2029, false],
    ['Dhanbad', 23.7957, 86.4304, false],
    ['Bokaro', 23.6693, 86.1511, false],
    ['Hazaribagh', 23.9925, 85.3637, false],
  ],
  Chhattisgarh: [
    ['Raipur', 21.2514, 81.6296, true],
    ['Bhilai', 21.1938, 81.3509, false],
    ['Bilaspur', 22.0797, 82.1409, false],
    ['Korba', 22.3595, 82.7501, false],
    ['Durg', 21.1904, 81.2849, false],
  ],
  Assam: [
    ['Guwahati', 26.1445, 91.7362, true],
    ['Silchar', 24.8333, 92.7789, false],
    ['Dibrugarh', 27.4728, 94.912, false],
    ['Jorhat', 26.7509, 94.2037, false],
    ['Tezpur', 26.6338, 92.7926, false],
  ],
  Uttarakhand: [
    ['Dehradun', 30.3165, 78.0322, true],
    ['Haridwar', 29.9457, 78.1642, false],
    ['Roorkee', 29.8543, 77.888, false],
    ['Haldwani', 29.2183, 79.513, false],
    ['Rishikesh', 30.0869, 78.2676, false],
  ],
  Goa: [
    ['Panaji', 15.4909, 73.8278, true],
    ['Margao', 15.2832, 73.9862, false],
    ['Vasco da Gama', 15.3982, 73.8113, false],
    ['Mapusa', 15.5937, 73.809, false],
    ['Ponda', 15.4027, 74.0078, false],
  ],
};

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  await client.connect();
  let added = 0;
  for (const [state, cities] of Object.entries(STATES)) {
    for (const [name, lat, lng, launched] of cities) {
      const r = await client.query(
        `insert into cities (name, slug, state, lat, lng, is_launched)
         values ($1,$2,$3,$4,$5,$6)
         on conflict (slug) do nothing returning id`,
        [name, slugify(name), state, lat, lng, launched]
      );
      if (r.rows[0]) added++;
    }
  }
  const totals = await client.query(
    `select count(*)::int as cities, count(distinct state)::int as states,
            count(*) filter (where is_launched)::int as launched from cities`
  );
  console.log(`added ${added} cities;`, totals.rows[0]);
  await client.end();
}
main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
