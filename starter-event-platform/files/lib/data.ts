import type { Event, Speaker, ScheduleSlot, Venue } from "@/types";

// ---------------------------------------------------------------------------
// Venues
// ---------------------------------------------------------------------------

const venues: Venue[] = [
  {
    name: "Moscone Center",
    address: "747 Howard St",
    city: "San Francisco, CA",
    capacity: 2000,
    mapUrl: "https://maps.google.com/?q=Moscone+Center+San+Francisco",
  },
  {
    name: "Brooklyn Expo Center",
    address: "72 Noble St",
    city: "Brooklyn, NY",
    capacity: 800,
    mapUrl: "https://maps.google.com/?q=Brooklyn+Expo+Center",
  },
  {
    name: "Austin Convention Center",
    address: "500 E Cesar Chavez St",
    city: "Austin, TX",
    capacity: 1500,
    mapUrl: "https://maps.google.com/?q=Austin+Convention+Center",
  },
  {
    name: "The Garage",
    address: "1130 Rainier Ave S",
    city: "Seattle, WA",
    capacity: 300,
    mapUrl: "https://maps.google.com/?q=The+Garage+Seattle",
  },
  {
    name: "Online",
    address: "Virtual Event",
    city: "Worldwide",
    capacity: 5000,
    mapUrl: "",
  },
  {
    name: "TechHub Chicago",
    address: "225 N Michigan Ave",
    city: "Chicago, IL",
    capacity: 500,
    mapUrl: "https://maps.google.com/?q=225+N+Michigan+Ave+Chicago",
  },
];

// ---------------------------------------------------------------------------
// Speakers
// ---------------------------------------------------------------------------

export const speakers: Speaker[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    title: "VP of Engineering",
    company: "Meta",
    bio: "Sarah leads the React infrastructure team at Meta, driving the evolution of component architecture and server-side rendering at scale. She has spoken at over 30 international conferences on frontend performance and developer experience.",
    image: "/placeholder-speaker.svg",
    topics: ["React", "Server Components", "Performance"],
    social: {
      twitter: "https://twitter.com/sarahchen",
      linkedin: "https://linkedin.com/in/sarahchen",
    },
  },
  {
    id: "marcus-johnson",
    name: "Marcus Johnson",
    title: "Staff Engineer",
    company: "Stripe",
    bio: "Marcus architects Stripe's payment processing infrastructure, handling millions of transactions per second. He is passionate about building reliable distributed systems and mentoring the next generation of systems engineers.",
    image: "/placeholder-speaker.svg",
    topics: ["Distributed Systems", "Payments", "Reliability"],
    social: {
      twitter: "https://twitter.com/marcusj",
      linkedin: "https://linkedin.com/in/marcusjohnson",
      website: "https://marcusjohnson.dev",
    },
  },
  {
    id: "elena-rodriguez",
    name: "Elena Rodriguez",
    title: "Head of Developer Relations",
    company: "Vercel",
    bio: "Elena bridges the gap between developer tooling and developer happiness at Vercel. She built the Next.js learning platform and has helped thousands of developers adopt modern web frameworks through workshops and tutorials.",
    image: "/placeholder-speaker.svg",
    topics: ["Next.js", "Developer Experience", "Edge Computing"],
    social: {
      twitter: "https://twitter.com/elenarodriguez",
      website: "https://elenarodriguez.io",
    },
  },
  {
    id: "james-okonkwo",
    name: "James Okonkwo",
    title: "Principal Data Scientist",
    company: "Databricks",
    bio: "James specializes in large-scale machine learning pipelines and real-time analytics. His research on efficient transformer architectures has been cited over 500 times. He advocates for responsible AI development and open-source ML tooling.",
    image: "/placeholder-speaker.svg",
    topics: ["Machine Learning", "Data Engineering", "AI Ethics"],
    social: {
      linkedin: "https://linkedin.com/in/jamesokonkwo",
      website: "https://jamesokonkwo.com",
    },
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    title: "CTO",
    company: "Figma",
    bio: "Priya oversees Figma's technical vision, from the real-time collaboration engine to the plugin ecosystem. Before Figma, she built multiplayer systems at Google and holds 12 patents in real-time synchronization technology.",
    image: "/placeholder-speaker.svg",
    topics: ["Collaboration", "WebAssembly", "Design Tools"],
    social: {
      twitter: "https://twitter.com/priyapatel",
      linkedin: "https://linkedin.com/in/priyapatel",
    },
  },
  {
    id: "alex-kim",
    name: "Alex Kim",
    title: "Security Engineering Lead",
    company: "Cloudflare",
    bio: "Alex leads Cloudflare's application security team, protecting millions of websites from zero-day exploits and DDoS attacks. He is a frequent contributor to OWASP and has disclosed over 20 critical vulnerabilities in major open-source projects.",
    image: "/placeholder-speaker.svg",
    topics: ["Security", "Zero Trust", "Edge Networks"],
    social: {
      twitter: "https://twitter.com/alexkim",
      website: "https://alexkim.security",
    },
  },
  {
    id: "rachel-taylor",
    name: "Rachel Taylor",
    title: "Director of Platform",
    company: "Shopify",
    bio: "Rachel leads the platform engineering team at Shopify, building the infrastructure that powers millions of online stores. She is an advocate for developer productivity, platform thinking, and building internal tools that scale.",
    image: "/placeholder-speaker.svg",
    topics: ["Platform Engineering", "Developer Productivity", "E-Commerce"],
    social: {
      linkedin: "https://linkedin.com/in/racheltaylor",
      website: "https://racheltaylor.dev",
    },
  },
  {
    id: "david-mueller",
    name: "David Mueller",
    title: "Co-Founder & CEO",
    company: "Temporal",
    bio: "David co-founded Temporal to solve the hardest problems in distributed application development. With 15 years of experience building workflow engines at Microsoft and Uber, he brings deep expertise in durable execution and fault-tolerant systems.",
    image: "/placeholder-speaker.svg",
    topics: ["Workflow Engines", "Microservices", "Fault Tolerance"],
    social: {
      twitter: "https://twitter.com/davidmueller",
      linkedin: "https://linkedin.com/in/davidmueller",
    },
  },
];

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const events: Event[] = [
  {
    id: "pulse-conf-2026",
    title: "PulseConf 2026",
    description:
      "The premier conference for frontend and fullstack engineers. Two days of cutting-edge talks, hands-on workshops, and networking with the brightest minds in web development. Featuring keynotes from industry leaders at Meta, Vercel, and Figma, plus deep-dive sessions on React Server Components, edge computing, and the future of developer tooling.",
    date: "2026-03-15",
    startTime: "09:00",
    endTime: "18:00",
    venue: venues[0],
    category: "conference",
    image: "/placeholder-event.svg",
    speakers: [speakers[0], speakers[2], speakers[4]],
    ticketTiers: [
      {
        id: "pulse-early",
        name: "Early Bird",
        price: 99,
        description: "Limited early bird pricing for the first 200 attendees",
        features: [
          "All conference talks",
          "Lunch and refreshments",
          "Conference swag bag",
          "Access to networking lounge",
        ],
        available: 42,
        maxPerOrder: 4,
      },
      {
        id: "pulse-general",
        name: "General Admission",
        price: 199,
        description: "Full access to all conference sessions and activities",
        features: [
          "All conference talks",
          "Lunch and refreshments",
          "Conference swag bag",
          "Access to networking lounge",
          "Workshop recordings",
        ],
        available: 350,
        maxPerOrder: 6,
      },
      {
        id: "pulse-vip",
        name: "VIP",
        price: 399,
        description: "Premium experience with exclusive access and perks",
        features: [
          "All General Admission perks",
          "Reserved front-row seating",
          "Speaker dinner invitation",
          "1-on-1 mentorship session",
          "Exclusive VIP lounge",
          "Early access to recordings",
        ],
        available: 25,
        maxPerOrder: 2,
      },
    ],
    featured: true,
    tags: ["React", "Next.js", "TypeScript", "Frontend", "Web Development"],
  },
  {
    id: "ai-builders-workshop",
    title: "AI Builders Workshop",
    description:
      "A hands-on, full-day workshop for developers building production AI applications. Learn to integrate large language models, build RAG pipelines, implement vector search, and deploy AI-powered features with confidence. Small group sizes ensure personalized guidance from expert instructors.",
    date: "2026-03-22",
    startTime: "10:00",
    endTime: "17:00",
    venue: venues[1],
    category: "workshop",
    image: "/placeholder-event.svg",
    speakers: [speakers[3], speakers[1]],
    ticketTiers: [
      {
        id: "ai-early",
        name: "Early Bird",
        price: 79,
        description: "Save $40 with early registration",
        features: [
          "Full-day workshop access",
          "Course materials and code repos",
          "Lunch provided",
          "Certificate of completion",
        ],
        available: 15,
        maxPerOrder: 2,
      },
      {
        id: "ai-general",
        name: "General Admission",
        price: 119,
        description: "Standard workshop registration",
        features: [
          "Full-day workshop access",
          "Course materials and code repos",
          "Lunch provided",
          "Certificate of completion",
          "30-day post-workshop support",
        ],
        available: 40,
        maxPerOrder: 4,
      },
    ],
    featured: true,
    tags: ["AI", "Machine Learning", "LLM", "RAG", "Python"],
  },
  {
    id: "security-summit",
    title: "CyberShield Security Summit",
    description:
      "An intensive conference dedicated to application security, zero-trust architecture, and threat modeling. Hear from security leaders at Cloudflare and Shopify about the latest attack vectors, defense strategies, and how to build security into your development workflow from day one.",
    date: "2026-03-29",
    startTime: "09:00",
    endTime: "17:30",
    venue: venues[2],
    category: "conference",
    image: "/placeholder-event.svg",
    speakers: [speakers[5], speakers[6]],
    ticketTiers: [
      {
        id: "sec-early",
        name: "Early Bird",
        price: 89,
        description: "Early registration discount",
        features: [
          "All summit sessions",
          "Security toolkit resources",
          "Lunch and coffee",
          "Networking reception",
        ],
        available: 60,
        maxPerOrder: 4,
      },
      {
        id: "sec-general",
        name: "General Admission",
        price: 159,
        description: "Full summit access",
        features: [
          "All summit sessions",
          "Security toolkit resources",
          "Lunch and coffee",
          "Networking reception",
          "CTF competition entry",
        ],
        available: 200,
        maxPerOrder: 6,
      },
      {
        id: "sec-vip",
        name: "VIP",
        price: 349,
        description: "Executive security briefing and premium access",
        features: [
          "All General Admission perks",
          "Executive threat briefing",
          "Private Q&A with speakers",
          "Priority seating",
          "Complimentary security audit consultation",
        ],
        available: 20,
        maxPerOrder: 2,
      },
    ],
    featured: false,
    tags: ["Security", "Zero Trust", "AppSec", "Threat Modeling", "DevSecOps"],
  },
  {
    id: "devx-meetup",
    title: "DevX Monthly: Building Developer Platforms",
    description:
      "Join our monthly developer experience meetup focused on platform engineering and internal tooling. This month features talks on building golden paths, measuring developer productivity, and scaling platform teams. Free pizza, drinks, and great conversations with fellow platform enthusiasts.",
    date: "2026-04-03",
    startTime: "18:30",
    endTime: "21:00",
    venue: venues[3],
    category: "meetup",
    image: "/placeholder-event.svg",
    speakers: [speakers[6], speakers[7]],
    ticketTiers: [
      {
        id: "devx-free",
        name: "Free RSVP",
        price: 0,
        description: "Reserve your spot at this free community event",
        features: [
          "Two lightning talks",
          "Networking session",
          "Free pizza and drinks",
          "Community Slack access",
        ],
        available: 80,
        maxPerOrder: 2,
      },
    ],
    featured: false,
    tags: ["Platform Engineering", "DevEx", "Internal Tools", "Community"],
  },
  {
    id: "cloud-native-webinar",
    title: "Cloud-Native Architecture: From Monolith to Microservices",
    description:
      "A live webinar walking through a real-world migration from monolithic architecture to cloud-native microservices. Learn about service decomposition strategies, data migration patterns, observability setup, and the organizational changes needed to succeed. Includes live Q&A with engineers who have done it at scale.",
    date: "2026-04-10",
    startTime: "11:00",
    endTime: "12:30",
    venue: venues[4],
    category: "webinar",
    image: "/placeholder-event.svg",
    speakers: [speakers[7], speakers[1]],
    ticketTiers: [
      {
        id: "webinar-free",
        name: "Free Registration",
        price: 0,
        description: "Register to receive the streaming link and recording",
        features: [
          "Live stream access",
          "Q&A participation",
          "Session recording",
          "Slide deck download",
        ],
        available: 2000,
        maxPerOrder: 1,
      },
      {
        id: "webinar-pro",
        name: "Pro Pass",
        price: 49,
        description: "Enhanced experience with bonus content",
        features: [
          "Live stream access",
          "Q&A participation",
          "Session recording",
          "Slide deck download",
          "Architecture decision template",
          "30-min group office hours",
        ],
        available: 100,
        maxPerOrder: 1,
      },
    ],
    featured: true,
    tags: ["Microservices", "Cloud Native", "Architecture", "Migration", "Kubernetes"],
  },
  {
    id: "hack-the-future",
    title: "Hack the Future: 48-Hour Hackathon",
    description:
      "A weekend-long hackathon challenging teams to build innovative solutions using AI, blockchain, or IoT. Compete for over $25,000 in prizes, get mentorship from industry experts, and demo your creation to a panel of judges from top tech companies. Open to all skill levels -- form a team or join one on the spot.",
    date: "2026-04-18",
    startTime: "18:00",
    endTime: "18:00",
    venue: venues[5],
    category: "hackathon",
    image: "/placeholder-event.svg",
    speakers: [speakers[0], speakers[3], speakers[4]],
    ticketTiers: [
      {
        id: "hack-early",
        name: "Early Bird",
        price: 49,
        description: "Discounted entry for early registrants",
        features: [
          "48-hour venue access",
          "All meals and snacks",
          "Hackathon t-shirt",
          "Mentor access",
          "Prize eligibility",
        ],
        available: 30,
        maxPerOrder: 5,
      },
      {
        id: "hack-general",
        name: "General Admission",
        price: 79,
        description: "Standard hackathon registration",
        features: [
          "48-hour venue access",
          "All meals and snacks",
          "Hackathon t-shirt",
          "Mentor access",
          "Prize eligibility",
          "Hardware lab access",
        ],
        available: 150,
        maxPerOrder: 5,
      },
    ],
    featured: false,
    tags: ["Hackathon", "AI", "IoT", "Blockchain", "Competition"],
  },
];

// ---------------------------------------------------------------------------
// Schedule Slots
// ---------------------------------------------------------------------------

export const scheduleSlots: ScheduleSlot[] = [
  // --- PulseConf 2026 ---
  {
    id: "pulse-registration",
    eventId: "pulse-conf-2026",
    time: "08:00",
    endTime: "09:00",
    title: "Registration & Breakfast",
    speaker: "",
    room: "Main Lobby",
    type: "break",
  },
  {
    id: "pulse-keynote",
    eventId: "pulse-conf-2026",
    time: "09:00",
    endTime: "10:00",
    title: "Keynote: The Future of React",
    speaker: "Sarah Chen",
    room: "Main Stage",
    type: "keynote",
  },
  {
    id: "pulse-talk-1",
    eventId: "pulse-conf-2026",
    time: "10:15",
    endTime: "11:00",
    title: "Building at the Edge with Next.js",
    speaker: "Elena Rodriguez",
    room: "Hall A",
    type: "talk",
  },
  {
    id: "pulse-talk-2",
    eventId: "pulse-conf-2026",
    time: "10:15",
    endTime: "11:00",
    title: "Real-Time Collaboration in the Browser",
    speaker: "Priya Patel",
    room: "Hall B",
    type: "talk",
  },
  {
    id: "pulse-lunch",
    eventId: "pulse-conf-2026",
    time: "12:00",
    endTime: "13:30",
    title: "Lunch & Networking",
    speaker: "",
    room: "Expo Hall",
    type: "break",
  },
  {
    id: "pulse-workshop-1",
    eventId: "pulse-conf-2026",
    time: "13:30",
    endTime: "15:00",
    title: "Hands-On: Server Components Deep Dive",
    speaker: "Sarah Chen",
    room: "Workshop Room 1",
    type: "workshop",
  },
  {
    id: "pulse-talk-3",
    eventId: "pulse-conf-2026",
    time: "15:15",
    endTime: "16:00",
    title: "Design Systems That Scale",
    speaker: "Priya Patel",
    room: "Main Stage",
    type: "talk",
  },
  {
    id: "pulse-networking",
    eventId: "pulse-conf-2026",
    time: "16:30",
    endTime: "18:00",
    title: "Closing Networking Reception",
    speaker: "",
    room: "Rooftop Terrace",
    type: "networking",
  },

  // --- AI Builders Workshop ---
  {
    id: "ai-intro",
    eventId: "ai-builders-workshop",
    time: "10:00",
    endTime: "10:30",
    title: "Welcome & Environment Setup",
    speaker: "James Okonkwo",
    room: "Workshop Lab",
    type: "talk",
  },
  {
    id: "ai-session-1",
    eventId: "ai-builders-workshop",
    time: "10:30",
    endTime: "12:00",
    title: "Building RAG Pipelines from Scratch",
    speaker: "James Okonkwo",
    room: "Workshop Lab",
    type: "workshop",
  },
  {
    id: "ai-lunch",
    eventId: "ai-builders-workshop",
    time: "12:00",
    endTime: "13:00",
    title: "Lunch Break",
    speaker: "",
    room: "Cafeteria",
    type: "break",
  },
  {
    id: "ai-session-2",
    eventId: "ai-builders-workshop",
    time: "13:00",
    endTime: "15:00",
    title: "Production-Ready LLM Integration",
    speaker: "Marcus Johnson",
    room: "Workshop Lab",
    type: "workshop",
  },
  {
    id: "ai-session-3",
    eventId: "ai-builders-workshop",
    time: "15:15",
    endTime: "17:00",
    title: "Deploying and Monitoring AI Features",
    speaker: "James Okonkwo",
    room: "Workshop Lab",
    type: "workshop",
  },

  // --- CyberShield Security Summit ---
  {
    id: "sec-keynote",
    eventId: "security-summit",
    time: "09:00",
    endTime: "10:00",
    title: "Keynote: The Evolving Threat Landscape",
    speaker: "Alex Kim",
    room: "Grand Ballroom",
    type: "keynote",
  },
  {
    id: "sec-talk-1",
    eventId: "security-summit",
    time: "10:15",
    endTime: "11:00",
    title: "Zero Trust Architecture in Practice",
    speaker: "Alex Kim",
    room: "Grand Ballroom",
    type: "talk",
  },
  {
    id: "sec-talk-2",
    eventId: "security-summit",
    time: "11:15",
    endTime: "12:00",
    title: "Securing the Supply Chain",
    speaker: "Rachel Taylor",
    room: "Room 201",
    type: "talk",
  },

  // --- Hack the Future ---
  {
    id: "hack-kickoff",
    eventId: "hack-the-future",
    time: "18:00",
    endTime: "19:00",
    title: "Kickoff & Team Formation",
    speaker: "Sarah Chen",
    room: "Main Floor",
    type: "keynote",
  },
  {
    id: "hack-mentor",
    eventId: "hack-the-future",
    time: "20:00",
    endTime: "21:00",
    title: "Mentor Office Hours",
    speaker: "James Okonkwo",
    room: "Mentor Lounge",
    type: "networking",
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function getEventById(id: string): Event | undefined {
  return events.find((event) => event.id === id);
}

export function getSpeakerById(id: string): Speaker | undefined {
  return speakers.find((speaker) => speaker.id === id);
}

export function getFeaturedEvents(): Event[] {
  return events.filter((event) => event.featured);
}

export function getScheduleByEvent(eventId: string): ScheduleSlot[] {
  return scheduleSlots.filter((slot) => slot.eventId === eventId);
}

export function getEventsByCategory(category: Event["category"]): Event[] {
  return events.filter((event) => event.category === category);
}

export function getSpeakerEvents(speakerId: string): Event[] {
  return events.filter((event) =>
    event.speakers.some((speaker) => speaker.id === speakerId)
  );
}
