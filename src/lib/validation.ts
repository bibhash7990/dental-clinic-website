import { z } from "zod";

export function minBookingDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function maxBookingDate(days = 90): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[+\d][\d\s()-]+$/, "Please enter a valid phone number"),
  serviceSlug: z.string().min(1, "Please choose a treatment"),
  dentistId: z.string().min(1, "Please choose a dentist"), // "any" or an id
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a time slot"),
  isNewPatient: z.boolean(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Honeypot — hidden from humans, irresistible to bots. */
  website: z.string().max(200).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// ---------- Phase 3 ----------

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Please choose a rating").max(5),
  text: z
    .string()
    .trim()
    .min(10, "Please write at least a sentence")
    .max(1500),
  authorName: z.string().trim().min(2, "Please enter your name").max(80),
  consent: z.literal(true, {
    error: "Please allow us to publish your review",
  }),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const intakeSchema = z.object({
  dateOfBirth: z.string().trim().min(4, "Please enter your date of birth"),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  emergencyName: z.string().trim().min(2, "Please add an emergency contact").max(100),
  emergencyPhone: z.string().trim().min(7, "Please add a contact number").max(20),
  physician: z.string().trim().max(100).optional().or(z.literal("")),
  conditions: z.array(z.string()),
  otherConditions: z.string().trim().max(500).optional().or(z.literal("")),
  medications: z.string().trim().max(500).optional().or(z.literal("")),
  allergies: z.string().trim().max(500).optional().or(z.literal("")),
  pregnant: z.enum(["no", "yes", "na"]),
  smoker: z.enum(["no", "occasionally", "daily"]),
  lastVisit: z.string().trim().max(60).optional().or(z.literal("")),
  dentalConcerns: z.string().trim().max(800).optional().or(z.literal("")),
  anxiety: z.enum(["none", "some", "high"]),
  insuranceProvider: z.string().trim().max(100).optional().or(z.literal("")),
  insuranceMemberId: z.string().trim().max(60).optional().or(z.literal("")),
  signature: z
    .string()
    .trim()
    .min(2, "Please type your full name to sign")
    .max(100),
  consent: z.literal(true, {
    error: "Please confirm the information is accurate",
  }),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

export const waitlistSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[+\d][\d\s()-]+$/, "Please enter a valid phone number"),
  serviceSlug: z.string().min(1, "Please choose a treatment"),
  dentistId: z.string().min(1),
  earliestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a start date"),
  latestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose an end date"),
  preference: z.enum(["ANY", "MORNING", "AFTERNOON"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  website: z.string().max(200).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Please choose a subject").max(120),
  message: z.string().trim().min(10, "Please write a short message").max(2000),
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
