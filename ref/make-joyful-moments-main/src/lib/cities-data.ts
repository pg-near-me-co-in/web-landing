// Frontend city directory used by /cities and the homepage featured section.
// Only Vadodara is live today; the rest are labelled "coming soon" and link to
// the /listings page pre-filtered by city slug so search engines still index them.

export type CityCard = {
  slug: string;           // used as ?city= filter on /listings
  name: string;
  state: string;
  image: string;
  tagline: string;
  count: string;          // "20+ options" style copy
  live: boolean;
};

export const CITIES: CityCard[] = [
  {
    slug: "vadodara",
    name: "Vadodara",
    state: "Gujarat",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=70",
    tagline: "Student hub around MSU, Alkapuri & Sayajigunj",
    count: "20+ options",
    live: true,
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=70",
    tagline: "Tech corridors from Koramangala to Whitefield",
    count: "Rolling out",
    live: false,
  },
  {
    slug: "pune",
    name: "Pune",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1567527207346-3c5cbf6d5b13?auto=format&fit=crop&w=1200&q=70",
    tagline: "Kothrud, Baner & Hinjewadi picks for movers",
    count: "Rolling out",
    live: false,
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1200&q=70",
    tagline: "Andheri, Powai & Navi Mumbai shared living",
    count: "Rolling out",
    live: false,
  },
  {
    slug: "delhi",
    name: "Delhi NCR",
    state: "Delhi",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=70",
    tagline: "Gurgaon, Noida & South Delhi stays",
    count: "Rolling out",
    live: false,
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    image: "https://images.unsplash.com/photo-1626196340104-fcd8b5c1ea24?auto=format&fit=crop&w=1200&q=70",
    tagline: "Gachibowli, Madhapur & HITEC City rooms",
    count: "Rolling out",
    live: false,
  },
  {
    slug: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    image: "https://images.unsplash.com/photo-1621996659490-3275b4d0d951?auto=format&fit=crop&w=1200&q=70",
    tagline: "SG Highway, Navrangpura & Bopal PGs",
    count: "Rolling out",
    live: false,
  },
  {
    slug: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=70",
    tagline: "OMR, Velachery & Adyar shared homes",
    count: "Rolling out",
    live: false,
  },
];
