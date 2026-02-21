import type { Job, Company, JobCategory } from "@/types";

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export const companies: Company[] = [
  {
    id: "nexus-ai",
    name: "Nexus AI",
    logo: "/placeholder-logo.svg",
    website: "https://nexusai.example.com",
    description:
      "Nexus AI builds enterprise-grade machine learning infrastructure that helps teams ship models faster. Our platform handles everything from data pipelines to real-time inference at scale.",
    industry: "Artificial Intelligence",
    size: "200-500",
    location: "San Francisco, CA",
    openPositions: 3,
  },
  {
    id: "cloudscale",
    name: "CloudScale",
    logo: "/placeholder-logo.svg",
    website: "https://cloudscale.example.com",
    description:
      "CloudScale provides next-generation cloud infrastructure for startups and enterprises. We make deploying, scaling, and monitoring distributed systems effortless.",
    industry: "Cloud Computing",
    size: "500-1000",
    location: "Seattle, WA",
    openPositions: 2,
  },
  {
    id: "devflow",
    name: "DevFlow",
    logo: "/placeholder-logo.svg",
    website: "https://devflow.example.com",
    description:
      "DevFlow streamlines the software development lifecycle with intelligent CI/CD pipelines, automated testing, and developer analytics. Trusted by 5,000+ engineering teams worldwide.",
    industry: "Developer Tools",
    size: "100-200",
    location: "Austin, TX",
    openPositions: 2,
  },
  {
    id: "pixelforge",
    name: "PixelForge",
    logo: "/placeholder-logo.svg",
    website: "https://pixelforge.example.com",
    description:
      "PixelForge is a design-first product studio creating beautiful, accessible digital experiences. We work with brands that care about craft and attention to detail.",
    industry: "Design & Creative",
    size: "50-100",
    location: "New York, NY",
    openPositions: 2,
  },
  {
    id: "datapulse",
    name: "DataPulse",
    logo: "/placeholder-logo.svg",
    website: "https://datapulse.example.com",
    description:
      "DataPulse turns raw data into actionable business intelligence. Our real-time analytics platform processes billions of events daily for Fortune 500 companies.",
    industry: "Data Analytics",
    size: "200-500",
    location: "Chicago, IL",
    openPositions: 2,
  },
  {
    id: "greenstack",
    name: "GreenStack",
    logo: "/placeholder-logo.svg",
    website: "https://greenstack.example.com",
    description:
      "GreenStack builds sustainable technology solutions for climate-conscious organizations. From carbon tracking APIs to energy optimization platforms, we code for the planet.",
    industry: "Climate Tech",
    size: "50-100",
    location: "Portland, OR",
    openPositions: 1,
  },
];

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export const jobs: Job[] = [
  // --- Nexus AI (3 jobs) ---
  {
    id: "nexus-senior-fe",
    title: "Senior Frontend Engineer",
    company: companies[0],
    location: "San Francisco, CA",
    type: "full-time",
    level: "senior",
    salary: { min: 150000, max: 190000 },
    description:
      "Join Nexus AI to build the interfaces that put machine learning in the hands of every developer. You will own our model management dashboard, experiment tracking UI, and real-time inference monitoring views. We value clean component architecture, accessibility, and delightful micro-interactions.",
    requirements: [
      "5+ years of professional frontend development experience",
      "Deep expertise in React and TypeScript",
      "Experience with data-heavy dashboards and real-time UIs",
      "Familiarity with design systems and component libraries",
      "Strong understanding of web performance optimization",
    ],
    benefits: [
      "Competitive equity package",
      "Unlimited PTO with 4-week minimum",
      "Home office stipend ($2,500)",
      "Annual learning budget ($3,000)",
      "Health, dental, and vision insurance",
    ],
    tags: ["React", "TypeScript", "Next.js", "Tailwind CSS", "WebSocket"],
    postedAt: "2026-02-19",
    featured: true,
  },
  {
    id: "nexus-ml-eng",
    title: "Machine Learning Engineer",
    company: companies[0],
    location: "San Francisco, CA",
    type: "full-time",
    level: "mid",
    salary: { min: 140000, max: 180000 },
    description:
      "Help us build the ML infrastructure that powers thousands of production models. You will work on model serving, feature stores, and training pipeline orchestration. Ideal for engineers who love systems thinking and want to operate at the intersection of ML and distributed systems.",
    requirements: [
      "3+ years of experience in ML engineering or related field",
      "Proficiency in Python and ML frameworks (PyTorch, TensorFlow)",
      "Experience with model serving and inference optimization",
      "Understanding of distributed systems and microservices",
      "Familiarity with Kubernetes and containerized workflows",
    ],
    benefits: [
      "Competitive equity package",
      "Unlimited PTO with 4-week minimum",
      "Conference travel budget",
      "Relocation assistance",
      "Health, dental, and vision insurance",
    ],
    tags: ["Python", "PyTorch", "Kubernetes", "MLOps", "Go"],
    postedAt: "2026-02-15",
    featured: true,
  },
  {
    id: "nexus-devops",
    title: "Platform Engineer",
    company: companies[0],
    location: "Remote",
    type: "remote",
    level: "senior",
    salary: { min: 155000, max: 195000 },
    description:
      "Own the infrastructure that keeps Nexus AI running at 99.99% uptime. You will design and maintain our Kubernetes clusters, CI/CD pipelines, and observability stack. This is a high-impact role where your decisions directly affect the reliability engineers and data scientists depend on every day.",
    requirements: [
      "5+ years of infrastructure or platform engineering experience",
      "Expert-level Kubernetes and Terraform knowledge",
      "Experience operating large-scale distributed systems",
      "Strong scripting skills (Bash, Python, or Go)",
      "On-call experience and incident management mindset",
    ],
    benefits: [
      "Fully remote with quarterly team offsites",
      "Competitive equity package",
      "Home office stipend ($3,000)",
      "Unlimited PTO",
      "Health, dental, and vision insurance",
    ],
    tags: ["Kubernetes", "Terraform", "AWS", "Prometheus", "Go"],
    postedAt: "2026-02-10",
    featured: false,
  },

  // --- CloudScale (2 jobs) ---
  {
    id: "cloud-backend",
    title: "Backend Engineer",
    company: companies[1],
    location: "Seattle, WA",
    type: "full-time",
    level: "mid",
    salary: { min: 130000, max: 170000 },
    description:
      "Build the APIs and services that power CloudScale's next-generation cloud platform. You will work on multi-tenant resource management, billing systems, and real-time infrastructure provisioning. Our stack is Go-first with PostgreSQL and gRPC at the core.",
    requirements: [
      "3+ years of backend development experience",
      "Proficiency in Go or similar systems language",
      "Experience with PostgreSQL and database design",
      "Understanding of RESTful APIs and gRPC",
      "Familiarity with cloud infrastructure (AWS, GCP, or Azure)",
    ],
    benefits: [
      "Annual bonus up to 15%",
      "401(k) with 4% match",
      "Hybrid schedule (3 days in office)",
      "Parental leave (16 weeks)",
      "Health, dental, and vision insurance",
    ],
    tags: ["Go", "PostgreSQL", "gRPC", "Docker", "AWS"],
    postedAt: "2026-02-18",
    featured: true,
  },
  {
    id: "cloud-fullstack",
    title: "Fullstack Developer",
    company: companies[1],
    location: "Seattle, WA",
    type: "full-time",
    level: "mid",
    salary: { min: 120000, max: 160000 },
    description:
      "Join the CloudScale Console team to build the web interface developers use to manage their cloud resources. You will own features end-to-end, from API design to pixel-perfect UI. We ship fast and iterate based on real user feedback.",
    requirements: [
      "3+ years of fullstack development experience",
      "Strong React and TypeScript skills",
      "Experience building and consuming REST APIs",
      "Comfort with Node.js or Go on the backend",
      "Eye for UI/UX and attention to detail",
    ],
    benefits: [
      "Annual bonus up to 15%",
      "401(k) with 4% match",
      "Hybrid schedule (3 days in office)",
      "Learning stipend ($2,000/year)",
      "Health, dental, and vision insurance",
    ],
    tags: ["React", "TypeScript", "Node.js", "REST", "Tailwind CSS"],
    postedAt: "2026-02-12",
    featured: false,
  },

  // --- DevFlow (2 jobs) ---
  {
    id: "devflow-fe",
    title: "Frontend Developer",
    company: companies[2],
    location: "Austin, TX",
    type: "full-time",
    level: "junior",
    salary: { min: 80000, max: 110000 },
    description:
      "Start your career at DevFlow building developer tools that thousands of teams rely on. You will work closely with senior engineers and designers to implement interactive pipeline visualizations, log viewers, and dashboard components. Great opportunity for growth-minded engineers who love clean code.",
    requirements: [
      "1+ years of frontend development experience (internships count)",
      "Solid understanding of React fundamentals",
      "Familiarity with TypeScript and modern CSS",
      "Eagerness to learn and take on new challenges",
      "Portfolio or side projects demonstrating frontend skills",
    ],
    benefits: [
      "Structured mentorship program",
      "Flexible working hours",
      "Learning budget ($1,500/year)",
      "Free lunch on office days",
      "Health and dental insurance",
    ],
    tags: ["React", "TypeScript", "CSS", "Storybook", "Vitest"],
    postedAt: "2026-02-17",
    featured: false,
  },
  {
    id: "devflow-product",
    title: "Product Manager",
    company: companies[2],
    location: "Austin, TX",
    type: "full-time",
    level: "senior",
    salary: { min: 140000, max: 175000 },
    description:
      "Lead product strategy for DevFlow's CI/CD platform. You will define the roadmap, prioritize features based on customer research, and work hand-in-hand with engineering and design to ship products that developers love. We are looking for someone with deep empathy for developer workflows.",
    requirements: [
      "5+ years of product management experience",
      "Background in developer tools or B2B SaaS",
      "Strong analytical skills and data-driven decision making",
      "Excellent written and verbal communication",
      "Technical background or ability to engage deeply with engineers",
    ],
    benefits: [
      "Equity participation",
      "Flexible working hours",
      "Conference attendance budget",
      "Unlimited PTO",
      "Health, dental, and vision insurance",
    ],
    tags: ["Product", "Strategy", "B2B", "Developer Tools", "Analytics"],
    postedAt: "2026-02-08",
    featured: false,
  },

  // --- PixelForge (2 jobs) ---
  {
    id: "pixel-designer",
    title: "Senior UI/UX Designer",
    company: companies[3],
    location: "New York, NY",
    type: "full-time",
    level: "senior",
    salary: { min: 130000, max: 165000 },
    description:
      "Shape the visual identity and user experience of products used by millions. At PixelForge, design is not a phase -- it is the product. You will lead design for client projects spanning fintech, health tech, and e-commerce, collaborating with a tight-knit team of designers and engineers.",
    requirements: [
      "5+ years of UI/UX design experience",
      "Expert proficiency in Figma and prototyping tools",
      "Strong portfolio demonstrating web and mobile design",
      "Experience with design systems and component libraries",
      "Understanding of accessibility standards (WCAG 2.1)",
    ],
    benefits: [
      "Creative sabbatical (1 month every 3 years)",
      "Design conference budget",
      "Flexible schedule",
      "Studio space in SoHo",
      "Health and dental insurance",
    ],
    tags: ["Figma", "UI/UX", "Design Systems", "Accessibility", "Prototyping"],
    postedAt: "2026-02-20",
    featured: true,
  },
  {
    id: "pixel-marketing",
    title: "Growth Marketing Manager",
    company: companies[3],
    location: "New York, NY",
    type: "contract",
    level: "mid",
    salary: { min: 90000, max: 120000 },
    description:
      "Drive PixelForge's brand awareness and client acquisition through data-informed marketing campaigns. You will own content strategy, paid channels, and community engagement. This is a 6-month contract with potential to convert to full-time.",
    requirements: [
      "3+ years of B2B or agency marketing experience",
      "Proven track record with content marketing and SEO",
      "Experience managing paid ad campaigns (Google, LinkedIn)",
      "Strong copywriting and storytelling skills",
      "Comfort with marketing analytics tools",
    ],
    benefits: [
      "Competitive contract rate",
      "Flexible remote schedule",
      "Access to team events and offsites",
      "Conversion path to full-time role",
    ],
    tags: ["Marketing", "SEO", "Content", "Analytics", "Growth"],
    postedAt: "2026-02-14",
    featured: false,
  },

  // --- DataPulse (2 jobs) ---
  {
    id: "data-scientist",
    title: "Senior Data Scientist",
    company: companies[4],
    location: "Chicago, IL",
    type: "full-time",
    level: "senior",
    salary: { min: 150000, max: 200000 },
    description:
      "Build the predictive models and statistical frameworks that power DataPulse's analytics platform. You will work with petabyte-scale datasets, develop anomaly detection algorithms, and create recommendation engines for enterprise clients. This role bridges research and production.",
    requirements: [
      "5+ years of data science experience",
      "Advanced degree in statistics, CS, or related field",
      "Expert Python skills with pandas, scikit-learn, and SQL",
      "Experience deploying models to production",
      "Strong communication skills for presenting to stakeholders",
    ],
    benefits: [
      "Competitive base + bonus",
      "Research publication support",
      "Conference attendance budget",
      "Flexible hybrid schedule",
      "Health, dental, and vision insurance",
    ],
    tags: ["Python", "SQL", "Machine Learning", "Statistics", "Spark"],
    postedAt: "2026-02-16",
    featured: false,
  },
  {
    id: "data-backend",
    title: "Data Platform Engineer",
    company: companies[4],
    location: "Remote",
    type: "remote",
    level: "lead",
    salary: { min: 170000, max: 200000 },
    description:
      "Architect and scale the data infrastructure that processes 10 billion events per day. You will lead a team of 4 engineers building streaming pipelines, data lakes, and query engines. If you thrive at the intersection of software engineering and data engineering, this role is for you.",
    requirements: [
      "7+ years of data or backend engineering experience",
      "Experience leading small engineering teams",
      "Deep knowledge of Apache Kafka, Spark, or Flink",
      "Proficiency in Java, Scala, or Python",
      "Track record of building systems at massive scale",
    ],
    benefits: [
      "Fully remote with quarterly team meetups",
      "Leadership development program",
      "Equity participation",
      "Unlimited PTO",
      "Health, dental, and vision insurance",
    ],
    tags: ["Kafka", "Spark", "Java", "Data Engineering", "Leadership"],
    postedAt: "2026-02-06",
    featured: false,
  },

  // --- GreenStack (1 job) ---
  {
    id: "green-fullstack",
    title: "Fullstack Engineer",
    company: companies[5],
    location: "Portland, OR",
    type: "part-time",
    level: "mid",
    salary: { min: 60000, max: 85000 },
    description:
      "Help build GreenStack's carbon tracking platform on a flexible part-time schedule. You will develop APIs for carbon emission calculations, build dashboards for sustainability reporting, and integrate with third-party environmental data sources. Perfect for engineers who want meaningful work with work-life balance.",
    requirements: [
      "2+ years of fullstack development experience",
      "Comfort with TypeScript, React, and Node.js",
      "Experience with REST API design and PostgreSQL",
      "Interest in sustainability and climate technology",
      "Self-motivated and comfortable working independently",
    ],
    benefits: [
      "Flexible 20-30 hours per week",
      "Fully remote option available",
      "Meaningful mission-driven work",
      "Path to full-time if desired",
      "Health insurance (pro-rated)",
    ],
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL", "Climate Tech"],
    postedAt: "2026-02-11",
    featured: false,
  },
];

// ---------------------------------------------------------------------------
// Job Categories
// ---------------------------------------------------------------------------

export const jobCategories: JobCategory[] = [
  { id: "engineering", name: "Engineering", icon: "Code2", count: 8 },
  { id: "design", name: "Design", icon: "Palette", count: 4 },
  { id: "product", name: "Product", icon: "Lightbulb", count: 3 },
  { id: "data-science", name: "Data Science", icon: "BarChart3", count: 5 },
  { id: "devops", name: "DevOps", icon: "Server", count: 6 },
  { id: "marketing", name: "Marketing", icon: "Megaphone", count: 2 },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function getJobById(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}

export function getJobsByCompany(companyId: string): Job[] {
  return jobs.filter((job) => job.company.id === companyId);
}

export function getCompanyById(id: string): Company | undefined {
  return companies.find((company) => company.id === id);
}

export function getJobsByType(type: Job["type"]): Job[] {
  return jobs.filter((job) => job.type === type);
}

export function getFeaturedJobs(): Job[] {
  return jobs.filter((job) => job.featured);
}
