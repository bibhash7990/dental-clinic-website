export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "How often should I visit the dentist?",
    answer:
      "For most patients we recommend a check-up and professional cleaning every six months. If you have gum disease, are prone to cavities, or wear orthodontic appliances, we may suggest more frequent visits to keep everything on track.",
  },
  {
    question: "Do you accept dental insurance?",
    answer:
      "Yes — we work with all major insurance providers and will verify your benefits before treatment so there are no surprises. Our front desk handles the claims paperwork for you, and we offer flexible payment plans for anything insurance doesn't cover.",
  },
  {
    question: "What should I do in a dental emergency?",
    answer:
      "Call us immediately. We reserve same-day emergency slots every weekday for severe pain, knocked-out teeth, and broken restorations. If a tooth is knocked out, keep it moist (in milk or saliva) and get to us within 60 minutes for the best chance of saving it.",
  },
  {
    question: "Is teeth whitening safe for my enamel?",
    answer:
      "Professional whitening, done after an exam and with custom protection for your gums, is completely safe for enamel. Over-the-counter kits used incorrectly are where problems occur — which is why we always start with a quick assessment.",
  },
  {
    question: "Do you treat nervous patients?",
    answer:
      "Every day. Tell us you're anxious when you book — we'll schedule extra time, explain everything before we start, and offer comfort options including noise-cancelling headphones and sedation for longer procedures. Many of our most loyal patients started out terrified of the dentist.",
  },
  {
    question: "At what age should my child first see a dentist?",
    answer:
      "We recommend a first visit by their first birthday, or within six months of the first tooth appearing. Early visits are short and friendly — the goal is simply to build comfort and catch any issues before they grow.",
  },
];
