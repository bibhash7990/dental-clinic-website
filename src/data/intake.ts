export const MEDICAL_CONDITIONS = [
  "Heart condition",
  "High blood pressure",
  "Diabetes",
  "Asthma",
  "Blood thinners",
  "Epilepsy",
  "Thyroid disorder",
  "Osteoporosis",
  "Immune condition",
  "Recent surgery",
] as const;

/** Field labels used when staff read a submitted form. */
export const INTAKE_LABELS: Record<string, string> = {
  dateOfBirth: "Date of birth",
  address: "Address",
  emergencyName: "Emergency contact",
  emergencyPhone: "Emergency phone",
  physician: "Doctor / GP",
  conditions: "Medical conditions",
  otherConditions: "Other conditions",
  medications: "Medications",
  allergies: "Allergies",
  pregnant: "Pregnant / breastfeeding",
  smoker: "Smokes or vapes",
  lastVisit: "Last dental visit",
  dentalConcerns: "Main concerns",
  anxiety: "Dental anxiety",
  insuranceProvider: "Insurance provider",
  insuranceMemberId: "Member ID",
  signature: "Signed",
};

/** Answers a clinician should notice at a glance. */
export const INTAKE_FLAG_FIELDS = [
  "conditions",
  "otherConditions",
  "medications",
  "allergies",
] as const;
