import type { Property, Agent, Neighborhood } from "@/types";

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export const agents: Agent[] = [
  {
    id: "agent-1",
    name: "Sarah Mitchell",
    title: "Senior Real Estate Broker",
    phone: "(512) 555-0147",
    email: "sarah.mitchell@example.com",
    image: "/placeholder-avatar.svg",
    bio: "With over 15 years in the Austin market, Sarah specializes in luxury homes and waterfront properties. She has consistently ranked in the top 1% of agents statewide and is known for her negotiation skills and deep knowledge of emerging neighborhoods.",
    specialties: ["Luxury Homes", "Waterfront Properties", "Investment Properties"],
    listingsCount: 42,
  },
  {
    id: "agent-2",
    name: "Marcus Rivera",
    title: "Buyer's Agent & Relocation Specialist",
    phone: "(303) 555-0238",
    email: "marcus.rivera@example.com",
    image: "/placeholder-avatar.svg",
    bio: "Marcus has helped over 300 families find their dream home in the Denver metro area. As a certified relocation specialist, he guides out-of-state buyers through every step of the process, from virtual tours to closing day.",
    specialties: ["First-Time Buyers", "Relocation Services", "Condos & Townhouses"],
    listingsCount: 28,
  },
  {
    id: "agent-3",
    name: "Jennifer Okafor",
    title: "Commercial & Residential Agent",
    phone: "(404) 555-0319",
    email: "jennifer.okafor@example.com",
    image: "/placeholder-avatar.svg",
    bio: "Jennifer brings a dual expertise in commercial and residential real estate across the Atlanta metro. Her background in urban planning gives her clients a unique edge when evaluating properties for long-term value and neighborhood growth potential.",
    specialties: ["Urban Properties", "New Construction", "Multi-Family"],
    listingsCount: 35,
  },
  {
    id: "agent-4",
    name: "David Chen",
    title: "Listing Agent & Market Analyst",
    phone: "(206) 555-0421",
    email: "david.chen@example.com",
    image: "/placeholder-avatar.svg",
    bio: "David combines data-driven market analysis with personalized service to help sellers maximize their returns. His background in data science allows him to price properties with precision, resulting in an average of 3% above asking price for his listings.",
    specialties: ["Seller Representation", "Market Analysis", "Staging & Preparation"],
    listingsCount: 31,
  },
];

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

export const properties: Property[] = [
  {
    id: "prop-1",
    title: "Modern Craftsman in East Austin",
    address: "2847 Chestnut Ave",
    city: "Austin",
    state: "TX",
    zip: "78702",
    price: 685000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2450,
    type: "house",
    status: "for-sale",
    description:
      "This beautifully renovated Craftsman home blends original charm with modern luxury. The open-concept main floor features hardwood floors, a chef's kitchen with quartz countertops, and a spacious living area bathed in natural light. The primary suite includes a walk-in closet and spa-inspired bathroom. The backyard offers a covered patio, mature oak trees, and a detached studio perfect for a home office.",
    features: [
      "Hardwood Floors",
      "Quartz Countertops",
      "Stainless Steel Appliances",
      "Walk-in Closet",
      "Covered Patio",
      "Detached Studio",
      "Smart Home System",
      "Energy-Efficient Windows",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 30.2612,
    lng: -97.7187,
    yearBuilt: 1948,
    agent: agents[0],
  },
  {
    id: "prop-2",
    title: "Luxury High-Rise Apartment Downtown",
    address: "100 Congress Ave, Unit 3201",
    city: "Austin",
    state: "TX",
    zip: "78701",
    price: 475000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1280,
    type: "apartment",
    status: "for-sale",
    description:
      "Live above the city in this stunning 32nd-floor apartment with panoramic views of Lady Bird Lake and the downtown skyline. Floor-to-ceiling windows fill the space with light, while premium finishes including Italian marble and custom cabinetry elevate every detail. Building amenities include a rooftop pool, fitness center, concierge service, and secure parking.",
    features: [
      "Floor-to-Ceiling Windows",
      "Italian Marble Bathrooms",
      "Rooftop Pool",
      "Concierge Service",
      "Fitness Center",
      "Secure Parking",
      "Pet Friendly",
      "In-Unit Laundry",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 30.2646,
    lng: -97.7454,
    yearBuilt: 2021,
    agent: agents[0],
  },
  {
    id: "prop-3",
    title: "Mountain View Townhouse",
    address: "1563 Spruce St, Unit B",
    city: "Boulder",
    state: "CO",
    zip: "80302",
    price: 520000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1850,
    type: "townhouse",
    status: "for-sale",
    description:
      "Nestled at the base of the Flatirons, this end-unit townhouse offers unobstructed mountain views from every level. The sun-drenched main floor features an open kitchen with a breakfast bar, gas fireplace, and direct patio access. Two generous bedrooms upstairs share a renovated hall bath, while the primary suite occupies the entire top floor with a private balcony.",
    features: [
      "Mountain Views",
      "Gas Fireplace",
      "Private Balcony",
      "Attached Garage",
      "Patio",
      "In-Unit Laundry",
      "Central Air",
      "Trail Access",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 40.0150,
    lng: -105.2705,
    yearBuilt: 2015,
    agent: agents[1],
  },
  {
    id: "prop-4",
    title: "Charming Bungalow in Grant Park",
    address: "891 Cherokee Ave SE",
    city: "Atlanta",
    state: "GA",
    zip: "30315",
    price: 395000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1620,
    type: "house",
    status: "for-sale",
    description:
      "This lovingly restored 1920s bungalow sits on a tree-lined street in the heart of historic Grant Park. Original details like crown molding, built-in bookcases, and a columned front porch have been preserved, while the kitchen and bathrooms feature tasteful modern updates. The fenced backyard includes raised garden beds and a fire pit area, perfect for entertaining.",
    features: [
      "Original Hardwood Floors",
      "Crown Molding",
      "Front Porch",
      "Fenced Backyard",
      "Updated Kitchen",
      "Raised Garden Beds",
      "Fire Pit",
      "Near BeltLine Trail",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 33.7371,
    lng: -84.3710,
    yearBuilt: 1924,
    agent: agents[2],
  },
  {
    id: "prop-5",
    title: "Waterfront Condo on Lake Union",
    address: "2600 Westlake Ave N, Unit 705",
    city: "Seattle",
    state: "WA",
    zip: "98109",
    price: 825000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1450,
    type: "condo",
    status: "for-sale",
    description:
      "Wake up to shimmering lake views and the Space Needle in this meticulously designed waterfront condo. The open floor plan maximizes natural light with walls of glass, while walnut floors and brushed-nickel fixtures create a warm contemporary feel. Enjoy the private dock, kayak storage, and residents-only rooftop deck with panoramic city and mountain views.",
    features: [
      "Waterfront Location",
      "Private Dock Access",
      "Kayak Storage",
      "Rooftop Deck",
      "Walnut Hardwood Floors",
      "In-Unit Laundry",
      "EV Charging",
      "Bike Storage",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 47.6435,
    lng: -122.3418,
    yearBuilt: 2019,
    agent: agents[3],
  },
  {
    id: "prop-6",
    title: "Spacious Family Home in Buckhead",
    address: "4210 Peachtree Dunwoody Rd",
    city: "Atlanta",
    state: "GA",
    zip: "30342",
    price: 1150000,
    bedrooms: 5,
    bathrooms: 4.5,
    sqft: 4200,
    type: "house",
    status: "for-sale",
    description:
      "This stately Buckhead residence offers generous living spaces designed for both everyday comfort and elegant entertaining. The two-story foyer opens to a formal living room with a marble fireplace, a chef's kitchen with a center island, and a sunlit breakfast room overlooking the private backyard. The finished basement includes a media room, wet bar, and guest suite with separate entrance.",
    features: [
      "Marble Fireplace",
      "Chef's Kitchen",
      "Center Island",
      "Finished Basement",
      "Media Room",
      "Wet Bar",
      "Guest Suite",
      "3-Car Garage",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 33.8568,
    lng: -84.3630,
    yearBuilt: 2008,
    agent: agents[2],
  },
  {
    id: "prop-7",
    title: "Industrial Loft in RiNo District",
    address: "3560 Brighton Blvd, Loft 4C",
    city: "Denver",
    state: "CO",
    zip: "80216",
    price: 390000,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 980,
    type: "apartment",
    status: "for-rent",
    description:
      "A true artist's loft in Denver's vibrant River North Art District. Soaring 16-foot ceilings, exposed brick walls, and polished concrete floors create a dramatic open-plan living space. Oversized factory windows flood the space with northern light. The building is surrounded by galleries, craft breweries, and the South Platte River trail.",
    features: [
      "16-Foot Ceilings",
      "Exposed Brick",
      "Polished Concrete Floors",
      "Oversized Windows",
      "Open Floor Plan",
      "Secure Entry",
      "Bike Room",
      "Walkable Neighborhood",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 39.7684,
    lng: -104.9714,
    yearBuilt: 1952,
    agent: agents[1],
  },
  {
    id: "prop-8",
    title: "Contemporary Townhome in Capitol Hill",
    address: "422 E Mercer St",
    city: "Seattle",
    state: "WA",
    zip: "98102",
    price: 749000,
    bedrooms: 3,
    bathrooms: 3.5,
    sqft: 2100,
    type: "townhouse",
    status: "for-sale",
    description:
      "This new-construction townhome pairs clean architectural lines with warm Pacific Northwest materials. The main level features an open kitchen with waterfall-edge counters, a dining area, and a living room with a linear gas fireplace. A rooftop deck with views of the Cascade Range provides an ideal retreat. Two private parking spaces and proximity to Volunteer Park complete the package.",
    features: [
      "New Construction",
      "Waterfall-Edge Counters",
      "Linear Gas Fireplace",
      "Rooftop Deck",
      "Mountain Views",
      "Heated Bathroom Floors",
      "2-Car Parking",
      "Near Volunteer Park",
    ],
    images: [
      "/placeholder-property.svg",
      "/placeholder-property.svg",
      "/placeholder-property.svg",
    ],
    lat: 47.6290,
    lng: -122.3228,
    yearBuilt: 2024,
    agent: agents[3],
  },
];

// ---------------------------------------------------------------------------
// Neighborhoods
// ---------------------------------------------------------------------------

export const neighborhoods: Neighborhood[] = [
  {
    id: "neighborhood-1",
    name: "East Austin",
    description:
      "Once an industrial corridor, East Austin has transformed into one of the city's most sought-after neighborhoods. Colorful murals line the streets alongside craft cocktail bars, farm-to-table restaurants, and independent boutiques. A strong sense of community and proximity to downtown make it a favorite for young professionals and growing families alike.",
    image: "/placeholder-neighborhood.svg",
    propertyCount: 124,
    avgPrice: 625000,
  },
  {
    id: "neighborhood-2",
    name: "Capitol Hill",
    description:
      "Seattle's most walkable neighborhood pulses with energy day and night. Tree-lined residential streets give way to a dense corridor of restaurants, live music venues, and independent shops along Broadway and Pike/Pine. Easy access to downtown, light rail, and multiple parks makes Capitol Hill a perennial favorite.",
    image: "/placeholder-neighborhood.svg",
    propertyCount: 87,
    avgPrice: 710000,
  },
  {
    id: "neighborhood-3",
    name: "Grant Park",
    description:
      "Centered around its namesake park and the Atlanta Zoo, Grant Park is one of the city's oldest neighborhoods. Victorian and Craftsman homes line the streets, while the Sunday farmers market and proximity to the BeltLine trail foster a tight-knit community. Rapid revitalization has brought new dining and retail without erasing the area's historic character.",
    image: "/placeholder-neighborhood.svg",
    propertyCount: 68,
    avgPrice: 425000,
  },
  {
    id: "neighborhood-4",
    name: "RiNo District",
    description:
      "Denver's River North Art District is a creative hub where converted warehouses house galleries, breweries, and tech startups. The area's industrial grit meets modern development along Brighton Boulevard, and the South Platte River trail provides miles of biking and running paths. Property values have surged as new mixed-use projects continue to reshape the skyline.",
    image: "/placeholder-neighborhood.svg",
    propertyCount: 53,
    avgPrice: 480000,
  },
  {
    id: "neighborhood-5",
    name: "Buckhead",
    description:
      "Atlanta's upscale enclave is known for grand estates, designer shopping along Peachtree Road, and a thriving dining scene. Tree-canopied streets and gated communities provide a serene counterpoint to the lively commercial districts. Top-rated schools and proximity to major employers make Buckhead a magnet for families seeking luxury and convenience.",
    image: "/placeholder-neighborhood.svg",
    propertyCount: 95,
    avgPrice: 980000,
  },
  {
    id: "neighborhood-6",
    name: "South Lake Union",
    description:
      "Once a quiet stretch of warehouses, South Lake Union is now Seattle's tech corridor, anchored by major campuses and a growing biotech cluster. Sleek high-rises, waterfront parks, and the historic Center for Wooden Boats create a neighborhood that balances innovation with recreation. The South Lake Union Trolley connects residents to downtown in minutes.",
    image: "/placeholder-neighborhood.svg",
    propertyCount: 72,
    avgPrice: 790000,
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getPropertiesByType(type: string): Property[] {
  return properties.filter((p) => p.type === type);
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getNeighborhoodById(id: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.id === id);
}
