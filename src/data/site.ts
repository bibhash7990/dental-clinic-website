export const site = {
  name: "BrightSmile Dental",
  tagline: "Modern dentistry with a gentle touch",
  description:
    "BrightSmile Dental is a full-service dental clinic offering cosmetic, restorative, preventive, and family dentistry with same-day appointments and modern technology.",
  phone: "+1 (555) 010-2030",
  email: "hello@brightsmile-demo.example",
  address: {
    line1: "42 Wellness Avenue",
    line2: "Suite 210",
    city: "Springfield",
    zip: "10001",
  },
  hours: [
    { day: "Monday", hours: "8:00 AM – 6:00 PM" },
    { day: "Tuesday", hours: "8:00 AM – 6:00 PM" },
    { day: "Wednesday", hours: "8:00 AM – 6:00 PM" },
    { day: "Thursday", hours: "8:00 AM – 6:00 PM" },
    { day: "Friday", hours: "8:00 AM – 4:00 PM" },
    { day: "Saturday", hours: "9:00 AM – 1:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
  },
  stats: [
    { value: "15+", label: "Years of Experience" },
    { value: "10k+", label: "Happy Smiles" },
    { value: "20+", label: "Treatments Offered" },
    { value: "98%", label: "Patient Satisfaction" },
  ],
} as const;

export function formatSlot(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}
