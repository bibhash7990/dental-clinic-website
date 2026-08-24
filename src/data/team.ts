export interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  bio: string;
  initials: string;
}

export const team: TeamMember[] = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Lead Dentist & Founder",
    credentials: "DDS, AAACD",
    bio: "With over 15 years in cosmetic and restorative dentistry, Dr. Mitchell founded BrightSmile to bring specialist-level care to everyday patients.",
    initials: "SM",
  },
  {
    name: "Dr. James Chen",
    role: "Oral Surgeon",
    credentials: "DMD, PhD",
    bio: "Dr. Chen leads our surgical department, specializing in dental implants, wisdom teeth, and bone regeneration with 3D-guided precision.",
    initials: "JC",
  },
  {
    name: "Dr. Emily Parker",
    role: "Orthodontist",
    credentials: "DDS, MS",
    bio: "From clear aligners to braces, Dr. Parker has straightened over 2,000 smiles and loves treating teens and adults alike.",
    initials: "EP",
  },
  {
    name: "Anna Rodriguez",
    role: "Head Dental Hygienist",
    credentials: "RDH",
    bio: "Anna makes every cleaning comfortable and every patient an expert in their own oral health. Gentle is her specialty.",
    initials: "AR",
  },
];
