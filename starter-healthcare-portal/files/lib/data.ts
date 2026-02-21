import type {
  Doctor,
  Appointment,
  HealthRecord,
  Department,
  TimeSlot,
} from "@/types";

// ---------------------------------------------------------------------------
// Doctors
// ---------------------------------------------------------------------------

export const doctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Evelyn Carter",
    title: "Chief of Cardiology",
    specialty: "Cardiology",
    image: "/placeholder-doctor.svg",
    bio: "Dr. Carter is a board-certified cardiologist with over 20 years of experience in interventional cardiology and heart failure management. She has pioneered minimally invasive techniques for valve repair and leads the cardiac catheterization lab at MediCare Plus. Her research on early detection of atrial fibrillation has been published in the New England Journal of Medicine.",
    education: [
      "MD, Johns Hopkins University School of Medicine",
      "Residency, Massachusetts General Hospital",
      "Fellowship in Interventional Cardiology, Cleveland Clinic",
    ],
    languages: ["English", "French"],
    rating: 4.9,
    reviewCount: 312,
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Okonkwo",
    title: "Senior Dermatologist",
    specialty: "Dermatology",
    image: "/placeholder-doctor.svg",
    bio: "Dr. Okonkwo specializes in medical and cosmetic dermatology, with particular expertise in treating skin conditions across all skin tones. He is a fellow of the American Academy of Dermatology and has conducted groundbreaking research on melanoma detection in patients with darker complexions. He takes a holistic approach to skin health, integrating lifestyle counseling with advanced treatment options.",
    education: [
      "MD, Howard University College of Medicine",
      "Residency in Dermatology, NYU Langone Health",
      "Fellowship in Dermatopathology, UCSF Medical Center",
    ],
    languages: ["English", "Igbo", "Spanish"],
    rating: 4.8,
    reviewCount: 247,
    availableDays: ["Monday", "Wednesday", "Thursday"],
  },
  {
    id: "doc-3",
    name: "Dr. Sarah Lindgren",
    title: "Orthopedic Surgeon",
    specialty: "Orthopedics",
    image: "/placeholder-doctor.svg",
    bio: "Dr. Lindgren is a fellowship-trained orthopedic surgeon specializing in sports medicine and joint reconstruction. A former collegiate athlete herself, she brings firsthand understanding of the demands athletes face in recovery. She has performed over 2,000 arthroscopic procedures and serves as the team physician for the city's professional soccer club.",
    education: [
      "MD, Stanford University School of Medicine",
      "Residency in Orthopedic Surgery, Hospital for Special Surgery",
      "Fellowship in Sports Medicine, Steadman Clinic",
    ],
    languages: ["English", "Swedish"],
    rating: 4.9,
    reviewCount: 189,
    availableDays: ["Tuesday", "Wednesday", "Friday"],
  },
  {
    id: "doc-4",
    name: "Dr. James Reyes",
    title: "Pediatrician",
    specialty: "Pediatrics",
    image: "/placeholder-doctor.svg",
    bio: "Dr. Reyes has dedicated his career to the health and well-being of children from infancy through adolescence. He is known for his gentle bedside manner and ability to put both children and parents at ease during visits. With special training in developmental pediatrics, he helps identify and support children with learning differences and behavioral challenges early in their development.",
    education: [
      "MD, University of Michigan Medical School",
      "Residency in Pediatrics, Children's Hospital of Philadelphia",
      "Board Certified in Developmental-Behavioral Pediatrics",
    ],
    languages: ["English", "Spanish", "Tagalog"],
    rating: 4.7,
    reviewCount: 421,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  {
    id: "doc-5",
    name: "Dr. Priya Mehta",
    title: "Neurologist",
    specialty: "Neurology",
    image: "/placeholder-doctor.svg",
    bio: "Dr. Mehta is a board-certified neurologist with expertise in headache medicine, multiple sclerosis, and neurodegenerative disorders. She directs the headache and migraine clinic at MediCare Plus and has helped thousands of patients find relief from chronic pain. Her current research focuses on the relationship between sleep disorders and cognitive decline.",
    education: [
      "MD, Yale School of Medicine",
      "Residency in Neurology, Mayo Clinic",
      "Fellowship in Headache Medicine, Jefferson Headache Center",
    ],
    languages: ["English", "Hindi", "Gujarati"],
    rating: 4.8,
    reviewCount: 198,
    availableDays: ["Monday", "Wednesday", "Thursday", "Friday"],
  },
  {
    id: "doc-6",
    name: "Dr. Robert Tanaka",
    title: "Family Medicine Physician",
    specialty: "General Practice",
    image: "/placeholder-doctor.svg",
    bio: "Dr. Tanaka provides comprehensive primary care for patients of all ages, from routine wellness exams to chronic disease management. With a background in both emergency medicine and family practice, he excels at diagnosing complex conditions and coordinating care across specialties. He is a strong advocate for preventive medicine and spends time with every patient to address their long-term health goals.",
    education: [
      "MD, University of Washington School of Medicine",
      "Residency in Family Medicine, Oregon Health & Science University",
      "Board Certified in Family Medicine",
    ],
    languages: ["English", "Japanese"],
    rating: 4.6,
    reviewCount: 534,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
];

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export const appointments: Appointment[] = [
  {
    id: "apt-1",
    doctorId: "doc-1",
    doctorName: "Dr. Evelyn Carter",
    specialty: "Cardiology",
    date: "2026-03-15",
    time: "09:00",
    status: "upcoming",
    type: "in-person",
    notes: "Annual cardiac check-up. Bring previous ECG results and current medication list.",
  },
  {
    id: "apt-2",
    doctorId: "doc-5",
    doctorName: "Dr. Priya Mehta",
    specialty: "Neurology",
    date: "2026-03-18",
    time: "14:30",
    status: "upcoming",
    type: "telehealth",
    notes: "Follow-up on migraine management plan. Discuss sleep study results.",
  },
  {
    id: "apt-3",
    doctorId: "doc-6",
    doctorName: "Dr. Robert Tanaka",
    specialty: "General Practice",
    date: "2026-03-22",
    time: "10:00",
    status: "upcoming",
    type: "in-person",
    notes: "Annual physical examination. Fasting blood work required — no food or drink after midnight.",
  },
  {
    id: "apt-4",
    doctorId: "doc-3",
    doctorName: "Dr. Sarah Lindgren",
    specialty: "Orthopedics",
    date: "2026-02-10",
    time: "11:00",
    status: "completed",
    type: "in-person",
    notes: "Post-operative follow-up for right knee arthroscopy. Range of motion improving well.",
  },
  {
    id: "apt-5",
    doctorId: "doc-4",
    doctorName: "Dr. James Reyes",
    specialty: "Pediatrics",
    date: "2026-02-05",
    time: "09:30",
    status: "completed",
    type: "in-person",
    notes: "Well-child visit for 6-year-old. Vaccinations up to date. Growth tracking normal.",
  },
  {
    id: "apt-6",
    doctorId: "doc-2",
    doctorName: "Dr. Marcus Okonkwo",
    specialty: "Dermatology",
    date: "2026-01-28",
    time: "15:00",
    status: "completed",
    type: "telehealth",
    notes: "Reviewed biopsy results — benign. Continue current skincare regimen.",
  },
  {
    id: "apt-7",
    doctorId: "doc-1",
    doctorName: "Dr. Evelyn Carter",
    specialty: "Cardiology",
    date: "2026-03-20",
    time: "13:00",
    status: "cancelled",
    type: "in-person",
    notes: "Stress test appointment — cancelled by patient. Rescheduled to April.",
  },
  {
    id: "apt-8",
    doctorId: "doc-5",
    doctorName: "Dr. Priya Mehta",
    specialty: "Neurology",
    date: "2026-02-14",
    time: "16:00",
    status: "cancelled",
    type: "telehealth",
    notes: "EEG consultation — cancelled due to scheduling conflict.",
  },
];

// ---------------------------------------------------------------------------
// Health Records
// ---------------------------------------------------------------------------

export const healthRecords: HealthRecord[] = [
  {
    id: "rec-1",
    date: "2026-02-15",
    type: "lab-result",
    title: "Comprehensive Metabolic Panel",
    doctor: "Dr. Robert Tanaka",
    summary: "All values within normal range. Glucose 92 mg/dL, creatinine 0.9 mg/dL, eGFR >90. Liver enzymes normal.",
    status: "normal",
  },
  {
    id: "rec-2",
    date: "2026-02-15",
    type: "lab-result",
    title: "Lipid Panel",
    doctor: "Dr. Robert Tanaka",
    summary: "Total cholesterol 218 mg/dL (borderline high). LDL 142 mg/dL elevated. HDL 58 mg/dL. Triglycerides 130 mg/dL. Lifestyle modifications recommended.",
    status: "attention",
  },
  {
    id: "rec-3",
    date: "2026-02-10",
    type: "visit-summary",
    title: "Orthopedic Post-Op Follow-Up",
    doctor: "Dr. Sarah Lindgren",
    summary: "Right knee arthroscopy recovery progressing well at 6 weeks post-op. Range of motion 0-125 degrees. Mild residual swelling. Continue physical therapy 2x/week. Return in 6 weeks.",
    status: "normal",
  },
  {
    id: "rec-4",
    date: "2026-02-05",
    type: "immunization",
    title: "Influenza Vaccine (2025-2026)",
    doctor: "Dr. James Reyes",
    summary: "Quadrivalent influenza vaccine administered in left deltoid. No adverse reactions observed during 15-minute monitoring period. Next flu vaccine due October 2026.",
    status: "normal",
  },
  {
    id: "rec-5",
    date: "2026-01-28",
    type: "visit-summary",
    title: "Dermatology Consultation — Skin Biopsy Results",
    doctor: "Dr. Marcus Okonkwo",
    summary: "Punch biopsy of left forearm lesion returned benign intradermal nevus. No dysplasia or malignancy detected. Annual skin exam recommended. Apply SPF 50 daily.",
    status: "normal",
  },
  {
    id: "rec-6",
    date: "2026-01-20",
    type: "prescription",
    title: "Sumatriptan 50mg — Migraine Management",
    doctor: "Dr. Priya Mehta",
    summary: "Sumatriptan 50mg tablets prescribed for acute migraine episodes. Take at onset of migraine, may repeat after 2 hours if needed. Maximum 200mg in 24 hours. Qty: 9 tablets, 1 refill.",
    status: "normal",
  },
  {
    id: "rec-7",
    date: "2026-01-15",
    type: "lab-result",
    title: "Hemoglobin A1C",
    doctor: "Dr. Robert Tanaka",
    summary: "HbA1c 5.4% — within normal range, indicating good blood sugar control over the past 3 months. No pre-diabetic indicators. Recheck in 12 months.",
    status: "normal",
  },
  {
    id: "rec-8",
    date: "2026-01-10",
    type: "visit-summary",
    title: "Cardiology Annual Review",
    doctor: "Dr. Evelyn Carter",
    summary: "Resting ECG normal sinus rhythm. Blood pressure 128/82 mmHg — mildly elevated. Echocardiogram shows normal ejection fraction (60%). Recommend dietary sodium reduction and follow-up in 6 months.",
    status: "attention",
  },
  {
    id: "rec-9",
    date: "2025-12-18",
    type: "prescription",
    title: "Lisinopril 10mg — Blood Pressure Management",
    doctor: "Dr. Evelyn Carter",
    summary: "Lisinopril 10mg daily prescribed for stage 1 hypertension. Monitor blood pressure at home twice weekly. Report any persistent cough or dizziness. Qty: 90 tablets, 3 refills.",
    status: "attention",
  },
  {
    id: "rec-10",
    date: "2025-12-01",
    type: "immunization",
    title: "Tdap Booster Vaccination",
    doctor: "Dr. Robert Tanaka",
    summary: "Tetanus, diphtheria, and pertussis booster administered in right deltoid. Mild soreness expected for 1-2 days. Next Td booster due in 10 years (December 2035).",
    status: "normal",
  },
];

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

export const departments: Department[] = [
  {
    id: "dept-1",
    name: "Cardiology",
    description: "Comprehensive heart and cardiovascular care including diagnostics, interventional procedures, and long-term management of heart conditions.",
    icon: "Heart",
    doctorCount: 8,
  },
  {
    id: "dept-2",
    name: "Dermatology",
    description: "Expert skin, hair, and nail care ranging from routine screenings and acne treatment to advanced cosmetic procedures and skin cancer detection.",
    icon: "Scan",
    doctorCount: 5,
  },
  {
    id: "dept-3",
    name: "Orthopedics",
    description: "Specialized care for bones, joints, muscles, and ligaments including sports medicine, joint replacement, and minimally invasive arthroscopic surgery.",
    icon: "Bone",
    doctorCount: 7,
  },
  {
    id: "dept-4",
    name: "Pediatrics",
    description: "Compassionate healthcare for infants, children, and adolescents covering wellness visits, vaccinations, developmental assessments, and acute illness care.",
    icon: "Baby",
    doctorCount: 10,
  },
  {
    id: "dept-5",
    name: "Neurology",
    description: "Diagnosis and treatment of disorders affecting the brain, spinal cord, and nervous system including migraines, epilepsy, stroke, and neurodegenerative diseases.",
    icon: "Brain",
    doctorCount: 6,
  },
  {
    id: "dept-6",
    name: "General Practice",
    description: "Primary care for the whole family including annual physicals, chronic disease management, preventive screenings, and coordination of specialist referrals.",
    icon: "Stethoscope",
    doctorCount: 12,
  },
];

// ---------------------------------------------------------------------------
// Time Slots
// ---------------------------------------------------------------------------

export const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: false },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: false },
  { time: "12:00", available: false },
  { time: "12:30", available: false },
  { time: "13:00", available: true },
  { time: "13:30", available: true },
  { time: "14:00", available: false },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: true },
  { time: "16:00", available: false },
  { time: "16:30", available: true },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function getDoctorById(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id);
}

export function getAppointmentsByStatus(
  status: Appointment["status"]
): Appointment[] {
  return appointments.filter((a) => a.status === status);
}

export function getRecordsByType(
  type: HealthRecord["type"]
): HealthRecord[] {
  return healthRecords.filter((r) => r.type === type);
}

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
