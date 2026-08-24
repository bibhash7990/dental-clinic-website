export interface Testimonial {
  name: string;
  treatment: string;
  quote: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    treatment: "Porcelain Veneers",
    quote:
      "The entire experience exceeded my expectations. My new veneers look completely natural — I can't stop smiling!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    treatment: "Dental Implants",
    quote:
      "After years of hiding my smile, the implant process was far easier than I feared. The team explained every step and the result is life-changing.",
    rating: 5,
  },
  {
    name: "Emma Davis",
    treatment: "Invisible Aligners",
    quote:
      "Straight teeth in 11 months without anyone noticing I was in treatment. The digital preview they showed me at the start matched the final result exactly.",
    rating: 5,
  },
  {
    name: "David Osei",
    treatment: "Root Canal Therapy",
    quote:
      "I came in with terrible pain and left the same afternoon pain-free. Honestly the most gentle dental work I've ever had done.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    treatment: "Children's Dentistry",
    quote:
      "My six-year-old actually asks when she gets to go back to the dentist. That says everything about this clinic.",
    rating: 5,
  },
  {
    name: "Tom Becker",
    treatment: "Teeth Whitening",
    quote:
      "One hour in the chair and my teeth are noticeably brighter for my wedding photos. Zero sensitivity afterwards, too.",
    rating: 4,
  },
];
