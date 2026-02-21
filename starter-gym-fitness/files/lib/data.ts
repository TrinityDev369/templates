import type {
  GymClass,
  Trainer,
  MembershipPlan,
  ScheduleEntry,
  Testimonial,
} from "@/types";

// ---------------------------------------------------------------------------
// Contact Info
// ---------------------------------------------------------------------------

export const contactInfo = {
  address: "742 Iron Peak Boulevard\nDenver, CO 80202",
  phone: "(555) 987-6543",
  phoneHref: "tel:+15559876543",
  email: "info@ironpeakfitness.com",
  emailHref: "mailto:info@ironpeakfitness.com",
  hours: [
    { days: "Monday - Friday", time: "5:00 AM - 11:00 PM" },
    { days: "Saturday", time: "6:00 AM - 10:00 PM" },
    { days: "Sunday", time: "7:00 AM - 9:00 PM" },
  ],
};

// ---------------------------------------------------------------------------
// Trainers
// ---------------------------------------------------------------------------

export const trainers: Trainer[] = [
  {
    id: "trainer-1",
    name: "Marcus Johnson",
    title: "Head Strength Coach",
    bio: "Marcus spent a decade competing in powerlifting before turning his focus to coaching. At Iron Peak Fitness he designs progressive strength programs that help members of every level build real-world power and confidence. His philosophy: master the basics, then push limits.",
    image: "/placeholder-trainer.svg",
    specialties: ["Strength Training", "Olympic Lifting", "Sports Performance"],
    certifications: ["NSCA-CSCS", "USAW Level 2", "ACE-CPT"],
    experience: 12,
  },
  {
    id: "trainer-2",
    name: "Sofia Reyes",
    title: "Yoga & Mobility Specialist",
    bio: "Sofia discovered yoga while recovering from a competitive gymnastics career and never looked back. She brings an athlete's discipline to every flow, blending traditional vinyasa with modern mobility science. Her classes at Iron Peak Fitness are equal parts challenging and restorative.",
    image: "/placeholder-trainer.svg",
    specialties: ["Power Yoga", "Mobility", "Breathwork"],
    certifications: ["RYT-500", "FRC Mobility Specialist", "NASM-CES"],
    experience: 9,
  },
  {
    id: "trainer-3",
    name: "Damon Carter",
    title: "HIIT & Boxing Coach",
    bio: "Former amateur middleweight champion, Damon channels his ring experience into explosive group training sessions. His HIIT and boxing classes at Iron Peak Fitness are renowned for high energy, tight technique, and results you can feel by week two.",
    image: "/placeholder-trainer.svg",
    specialties: ["Boxing", "HIIT", "Metabolic Conditioning"],
    certifications: ["NASM-CPT", "USA Boxing Coach Level 1", "ACE Group Fitness"],
    experience: 8,
  },
  {
    id: "trainer-4",
    name: "Elena Petrova",
    title: "Cycling & Cardio Lead",
    bio: "Elena raced road bikes across Europe before bringing her endurance expertise indoors. She designs rhythm-driven cycling sessions that marry heart-rate science with playlist curation. At Iron Peak Fitness, her Spin Cycle class consistently fills to capacity.",
    image: "/placeholder-trainer.svg",
    specialties: ["Indoor Cycling", "Cardio Endurance", "Pilates"],
    certifications: ["ACE-CPT", "Schwinn Certified Instructor", "STOTT Pilates Mat"],
    experience: 7,
  },
];

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export const gymClasses: GymClass[] = [
  {
    id: "class-1",
    name: "HIIT Inferno",
    description:
      "A high-intensity interval session that alternates explosive bursts with active recovery. Expect kettlebells, battle ropes, and bodyweight drills designed to torch calories and build functional endurance. No two sessions are the same.",
    duration: 45,
    intensity: "advanced",
    category: "hiit",
    trainer: trainers[2],
    image: "/placeholder-class.svg",
    maxCapacity: 20,
  },
  {
    id: "class-2",
    name: "Power Yoga",
    description:
      "A dynamic vinyasa flow that builds strength, balance, and flexibility. Each class progresses through standing sequences, inversions, and deep stretches, finishing with guided breathwork. Suitable for all levels with modifications provided.",
    duration: 60,
    intensity: "intermediate",
    category: "yoga",
    trainer: trainers[1],
    image: "/placeholder-class.svg",
    maxCapacity: 25,
  },
  {
    id: "class-3",
    name: "Boxing Fundamentals",
    description:
      "Learn proper stance, footwork, and punch mechanics before putting it all together on the heavy bag. This class builds coordination, reflexes, and serious upper-body conditioning. Gloves provided for first-timers.",
    duration: 50,
    intensity: "beginner",
    category: "boxing",
    trainer: trainers[2],
    image: "/placeholder-class.svg",
    maxCapacity: 16,
  },
  {
    id: "class-4",
    name: "Spin Cycle",
    description:
      "A rhythm-based indoor cycling workout calibrated to heart-rate zones. Climb hills, sprint flats, and recover in sync with a curated playlist. Real-time metrics keep you accountable while the group energy keeps you pushing.",
    duration: 45,
    intensity: "intermediate",
    category: "cycling",
    trainer: trainers[3],
    image: "/placeholder-class.svg",
    maxCapacity: 30,
  },
  {
    id: "class-5",
    name: "Strength Training",
    description:
      "A structured barbell and dumbbell session focused on compound lifts: squat, bench, deadlift, and overhead press. Programmed with progressive overload so you get measurably stronger each week. Coaching cues provided throughout.",
    duration: 60,
    intensity: "intermediate",
    category: "strength",
    trainer: trainers[0],
    image: "/placeholder-class.svg",
    maxCapacity: 12,
  },
  {
    id: "class-6",
    name: "Pilates Core",
    description:
      "A mat-based pilates class zeroing in on deep core stability, spinal alignment, and controlled movement. Expect slow, precise reps that ignite muscles you did not know you had. Perfect for recovery days or as a complement to heavy training.",
    duration: 50,
    intensity: "beginner",
    category: "cardio",
    trainer: trainers[3],
    image: "/placeholder-class.svg",
    maxCapacity: 20,
  },
];

// ---------------------------------------------------------------------------
// Membership Plans
// ---------------------------------------------------------------------------

export const membershipPlans: MembershipPlan[] = [
  {
    id: "plan-basic",
    name: "Basic",
    price: 29,
    interval: "month",
    features: [
      "Full gym floor access",
      "Locker room & showers",
      "2 group classes per week",
      "Iron Peak Fitness app",
    ],
    popular: false,
    cta: "Get Started",
  },
  {
    id: "plan-pro",
    name: "Pro",
    price: 59,
    interval: "month",
    features: [
      "Everything in Basic",
      "Unlimited group classes",
      "1 personal training session / month",
      "Sauna & recovery zone",
      "Guest pass (1 per month)",
    ],
    popular: true,
    cta: "Join Pro",
  },
  {
    id: "plan-elite",
    name: "Elite",
    price: 99,
    interval: "month",
    features: [
      "Everything in Pro",
      "4 personal training sessions / month",
      "Custom nutrition plan",
      "Priority class booking",
      "Unlimited guest passes",
      "Exclusive member events",
    ],
    popular: false,
    cta: "Go Elite",
  },
];

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export const schedule: ScheduleEntry[] = [
  // Monday
  { id: "sch-1", classId: "class-5", className: "Strength Training", trainerId: "trainer-1", trainerName: "Marcus Johnson", day: "monday", startTime: "06:00", endTime: "07:00", room: "Iron Room" },
  { id: "sch-2", classId: "class-2", className: "Power Yoga", trainerId: "trainer-2", trainerName: "Sofia Reyes", day: "monday", startTime: "07:30", endTime: "08:30", room: "Mind & Body Studio" },
  { id: "sch-3", classId: "class-1", className: "HIIT Inferno", trainerId: "trainer-3", trainerName: "Damon Carter", day: "monday", startTime: "12:00", endTime: "12:45", room: "Performance Floor" },
  { id: "sch-4", classId: "class-4", className: "Spin Cycle", trainerId: "trainer-4", trainerName: "Elena Petrova", day: "monday", startTime: "17:30", endTime: "18:15", room: "Cycle Studio" },

  // Tuesday
  { id: "sch-5", classId: "class-3", className: "Boxing Fundamentals", trainerId: "trainer-3", trainerName: "Damon Carter", day: "tuesday", startTime: "06:30", endTime: "07:20", room: "Ring Room" },
  { id: "sch-6", classId: "class-6", className: "Pilates Core", trainerId: "trainer-4", trainerName: "Elena Petrova", day: "tuesday", startTime: "09:00", endTime: "09:50", room: "Mind & Body Studio" },
  { id: "sch-7", classId: "class-5", className: "Strength Training", trainerId: "trainer-1", trainerName: "Marcus Johnson", day: "tuesday", startTime: "12:00", endTime: "13:00", room: "Iron Room" },
  { id: "sch-8", classId: "class-2", className: "Power Yoga", trainerId: "trainer-2", trainerName: "Sofia Reyes", day: "tuesday", startTime: "18:00", endTime: "19:00", room: "Mind & Body Studio" },

  // Wednesday
  { id: "sch-9", classId: "class-1", className: "HIIT Inferno", trainerId: "trainer-3", trainerName: "Damon Carter", day: "wednesday", startTime: "06:00", endTime: "06:45", room: "Performance Floor" },
  { id: "sch-10", classId: "class-4", className: "Spin Cycle", trainerId: "trainer-4", trainerName: "Elena Petrova", day: "wednesday", startTime: "07:30", endTime: "08:15", room: "Cycle Studio" },
  { id: "sch-11", classId: "class-5", className: "Strength Training", trainerId: "trainer-1", trainerName: "Marcus Johnson", day: "wednesday", startTime: "12:00", endTime: "13:00", room: "Iron Room" },
  { id: "sch-12", classId: "class-3", className: "Boxing Fundamentals", trainerId: "trainer-3", trainerName: "Damon Carter", day: "wednesday", startTime: "17:30", endTime: "18:20", room: "Ring Room" },

  // Thursday
  { id: "sch-13", classId: "class-2", className: "Power Yoga", trainerId: "trainer-2", trainerName: "Sofia Reyes", day: "thursday", startTime: "06:30", endTime: "07:30", room: "Mind & Body Studio" },
  { id: "sch-14", classId: "class-6", className: "Pilates Core", trainerId: "trainer-4", trainerName: "Elena Petrova", day: "thursday", startTime: "09:00", endTime: "09:50", room: "Mind & Body Studio" },
  { id: "sch-15", classId: "class-1", className: "HIIT Inferno", trainerId: "trainer-3", trainerName: "Damon Carter", day: "thursday", startTime: "12:00", endTime: "12:45", room: "Performance Floor" },
  { id: "sch-16", classId: "class-5", className: "Strength Training", trainerId: "trainer-1", trainerName: "Marcus Johnson", day: "thursday", startTime: "18:00", endTime: "19:00", room: "Iron Room" },

  // Friday
  { id: "sch-17", classId: "class-4", className: "Spin Cycle", trainerId: "trainer-4", trainerName: "Elena Petrova", day: "friday", startTime: "06:00", endTime: "06:45", room: "Cycle Studio" },
  { id: "sch-18", classId: "class-3", className: "Boxing Fundamentals", trainerId: "trainer-3", trainerName: "Damon Carter", day: "friday", startTime: "12:00", endTime: "12:50", room: "Ring Room" },
  { id: "sch-19", classId: "class-5", className: "Strength Training", trainerId: "trainer-1", trainerName: "Marcus Johnson", day: "friday", startTime: "17:00", endTime: "18:00", room: "Iron Room" },
  { id: "sch-20", classId: "class-2", className: "Power Yoga", trainerId: "trainer-2", trainerName: "Sofia Reyes", day: "friday", startTime: "18:30", endTime: "19:30", room: "Mind & Body Studio" },

  // Saturday
  { id: "sch-21", classId: "class-1", className: "HIIT Inferno", trainerId: "trainer-3", trainerName: "Damon Carter", day: "saturday", startTime: "08:00", endTime: "08:45", room: "Performance Floor" },
  { id: "sch-22", classId: "class-4", className: "Spin Cycle", trainerId: "trainer-4", trainerName: "Elena Petrova", day: "saturday", startTime: "09:00", endTime: "09:45", room: "Cycle Studio" },
  { id: "sch-23", classId: "class-2", className: "Power Yoga", trainerId: "trainer-2", trainerName: "Sofia Reyes", day: "saturday", startTime: "10:00", endTime: "11:00", room: "Mind & Body Studio" },
  { id: "sch-24", classId: "class-6", className: "Pilates Core", trainerId: "trainer-4", trainerName: "Elena Petrova", day: "saturday", startTime: "11:30", endTime: "12:20", room: "Mind & Body Studio" },
];

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "Rachel Kim",
    image: "/placeholder-member.svg",
    quote:
      "I joined Iron Peak Fitness six months ago barely able to do a push-up. Marcus' Strength Training class gave me a clear path forward, and now I'm deadlifting my own bodyweight. The coaches here genuinely care about your progress.",
    memberSince: "2025",
    rating: 5,
  },
  {
    id: "test-2",
    name: "David Okonkwo",
    image: "/placeholder-member.svg",
    quote:
      "The HIIT Inferno class is no joke. Damon pushes you hard but always keeps form in check. I have tried a dozen gyms in this city and Iron Peak is the first one that made me actually look forward to 6 AM workouts.",
    memberSince: "2024",
    rating: 5,
  },
  {
    id: "test-3",
    name: "Sarah Mitchell",
    image: "/placeholder-member.svg",
    quote:
      "Sofia's Power Yoga class is the perfect counterbalance to my desk job. My back pain is gone, my flexibility has skyrocketed, and the Mind & Body Studio is genuinely beautiful. Worth every penny of the Pro membership.",
    memberSince: "2024",
    rating: 4,
  },
  {
    id: "test-4",
    name: "James Thornton",
    image: "/placeholder-member.svg",
    quote:
      "Switching to the Elite plan was the best investment I have made in myself. The personalized nutrition guidance combined with priority booking means I never miss a Spin Cycle session. Iron Peak runs like a well-oiled machine.",
    memberSince: "2023",
    rating: 5,
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getClassById(id: string): GymClass | undefined {
  return gymClasses.find((c) => c.id === id);
}

export function getTrainerById(id: string): Trainer | undefined {
  return trainers.find((t) => t.id === id);
}

export function getScheduleByDay(day: ScheduleEntry["day"]): ScheduleEntry[] {
  return schedule.filter((entry) => entry.day === day);
}
