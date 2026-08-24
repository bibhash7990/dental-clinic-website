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
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Please choose a subject").max(120),
  message: z.string().trim().min(10, "Please write a short message").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
