export type ServiceCategory =
  | "cosmetic"
  | "restorative"
  | "preventive"
  | "surgical"
  | "orthodontic"
  | "pediatric"
  | "periodontal"
  | "endodontic"
  | "technology";

export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: ServiceCategory;
  features: string[];
  image: string;
  duration: string;
  priceFrom: number;
}

export const categories: { id: ServiceCategory | "all"; name: string }[] = [
  { id: "all", name: "All Services" },
  { id: "cosmetic", name: "Cosmetic" },
  { id: "restorative", name: "Restorative" },
  { id: "preventive", name: "Preventive" },
  { id: "surgical", name: "Surgical" },
  { id: "orthodontic", name: "Orthodontic" },
  { id: "pediatric", name: "Pediatric" },
  { id: "periodontal", name: "Periodontal" },
  { id: "endodontic", name: "Endodontic" },
  { id: "technology", name: "Technology" },
];

export const services: Service[] = [
  {
    id: 1,
    slug: "porcelain-veneers",
    title: "Porcelain Veneers",
    description:
      "Transform your smile with custom-crafted porcelain veneers, designed to perfect your teeth's appearance.",
    longDescription:
      "Porcelain veneers are ultra-thin, custom-made shells bonded to the front surface of your teeth. They correct chips, gaps, discoloration, and minor misalignment in as few as two visits. Each veneer is designed digitally and hand-finished by our ceramist to match the translucency of natural enamel, so the result looks like you — only brighter.",
    category: "cosmetic",
    features: [
      "Custom-designed for your smile",
      "Natural-looking results",
      "Stain-resistant material",
      "Long-lasting beauty",
    ],
    image: "/images/services/cosmetic.jpg",
    duration: "2 visits · 60–90 min each",
    priceFrom: 450,
  },
  {
    id: 2,
    slug: "teeth-whitening",
    title: "Professional Teeth Whitening",
    description:
      "Achieve a brighter, more radiant smile with our advanced teeth whitening treatments.",
    longDescription:
      "Our in-office whitening lifts years of coffee, tea, and wine stains in a single one-hour appointment, safely brightening teeth by up to eight shades. Prefer to whiten gradually? We also make custom take-home trays with professional-strength gel. Every treatment starts with an exam so we can protect sensitive areas and guarantee even results.",
    category: "cosmetic",
    features: [
      "In-office power whitening",
      "Take-home whitening kits",
      "Lasting results",
      "Safe and effective",
    ],
    image: "/images/services/whitening.jpg",
    duration: "1 visit · 60 min",
    priceFrom: 120,
  },
  {
    id: 3,
    slug: "composite-bonding",
    title: "Composite Bonding",
    description:
      "Restore chipped, cracked, or discolored teeth with natural-looking composite materials.",
    longDescription:
      "Composite bonding sculpts tooth-colored resin directly onto the tooth to repair chips, close small gaps, and mask discoloration — usually in a single visit with no drilling and no anesthetic. It is the most conservative and affordable way to refresh a smile, and the material is color-matched precisely to your enamel.",
    category: "cosmetic",
    features: [
      "Same-day results",
      "Minimally invasive",
      "Color-matched material",
      "Affordable solution",
    ],
    image: "/images/services/bonding.jpg",
    duration: "1 visit · 30–60 min",
    priceFrom: 90,
  },
  {
    id: 4,
    slug: "dental-implants",
    title: "Dental Implants",
    description:
      "Restore your smile with permanent, natural-looking dental implant solutions.",
    longDescription:
      "A dental implant replaces a missing tooth from root to crown. A biocompatible titanium post integrates with your jaw bone, then a custom ceramic crown completes the restoration. Implants look, feel, and function like natural teeth, protect the bone from shrinking, and — with good care — can last a lifetime.",
    category: "restorative",
    features: [
      "Titanium root replacement",
      "Natural-looking crown",
      "Permanent solution",
      "Preserves jaw bone",
    ],
    image: "/images/services/implants.jpg",
    duration: "2–3 visits over 3–6 months",
    priceFrom: 900,
  },
  {
    id: 5,
    slug: "ceramic-crowns",
    title: "Ceramic Crowns",
    description:
      "Protect and restore damaged teeth with custom-made ceramic crowns.",
    longDescription:
      "When a tooth is cracked, heavily filled, or weakened after root canal treatment, a crown restores its full strength and appearance. Using CEREC same-day technology, we design, mill, and place many crowns in a single appointment — no temporaries, no second visit, no goopy impressions.",
    category: "restorative",
    features: [
      "Same-day CEREC crowns",
      "Natural appearance",
      "Durable material",
      "Perfect fit",
    ],
    image: "/images/services/crowns.jpg",
    duration: "1 visit · 2 hours",
    priceFrom: 550,
  },
  {
    id: 6,
    slug: "dental-bridges",
    title: "Dental Bridges",
    description: "Fill gaps in your smile with custom-designed dental bridges.",
    longDescription:
      "A bridge closes the gap left by one or more missing teeth by anchoring a lifelike replacement to the neighboring teeth or implants. Bridges restore your bite, keep remaining teeth from drifting, and are completed in just two comfortable visits.",
    category: "restorative",
    features: [
      "Fixed or removable options",
      "Natural appearance",
      "Restored functionality",
      "Long-lasting results",
    ],
    image: "/images/services/bridges.jpg",
    duration: "2 visits · 60–90 min each",
    priceFrom: 700,
  },
  {
    id: 7,
    slug: "comprehensive-checkups",
    title: "Comprehensive Check-ups",
    description:
      "Maintain optimal oral health with regular dental examinations and cleanings.",
    longDescription:
      "Prevention is the best dentistry. Your six-monthly visit includes a full examination, digital low-radiation X-rays when needed, an oral cancer screening, gum health charting, and a professional clean and polish. We finish with a clear, pressure-free plan for anything that needs attention.",
    category: "preventive",
    features: [
      "Digital X-rays",
      "Oral cancer screening",
      "Periodontal evaluation",
      "Professional cleaning",
    ],
    image: "/images/services/checkup.jpg",
    duration: "1 visit · 45–60 min",
    priceFrom: 60,
  },
  {
    id: 8,
    slug: "dental-sealants",
    title: "Dental Sealants",
    description: "Protect vulnerable teeth from decay with dental sealants.",
    longDescription:
      "Sealants are a thin protective coating painted onto the chewing surfaces of back teeth, sealing the deep grooves where cavities most often start. Application is quick, painless, and especially valuable for children and teens — a sealed tooth is up to 80% less likely to decay.",
    category: "preventive",
    features: [
      "Cavity prevention",
      "Quick application",
      "Long-lasting protection",
      "Ideal for children",
    ],
    image: "/images/services/sealants.jpg",
    duration: "1 visit · 20–30 min",
    priceFrom: 35,
  },
  {
    id: 9,
    slug: "wisdom-teeth-removal",
    title: "Wisdom Teeth Removal",
    description:
      "Safe and comfortable extraction of problematic wisdom teeth.",
    longDescription:
      "Impacted or crowded wisdom teeth can cause pain, infection, and damage to neighboring teeth. Our surgical team removes them gently under your choice of local anesthetic or sedation, with 3D imaging used to plan every extraction precisely. Most patients are back to normal routines within a few days.",
    category: "surgical",
    features: [
      "Sedation options",
      "Expert care",
      "Quick recovery",
      "Pain management",
    ],
    image: "/images/services/wisdom.jpg",
    duration: "1 visit · 45–90 min",
    priceFrom: 250,
  },
  {
    id: 10,
    slug: "bone-grafting",
    title: "Bone Grafting",
    description:
      "Strengthen your jaw bone for dental implants or other procedures.",
    longDescription:
      "After a tooth is lost, the jaw bone beneath it naturally shrinks — sometimes too much to support an implant. Bone grafting rebuilds that foundation using safe, modern grafting materials, restoring the volume needed for successful implant placement and a natural facial profile.",
    category: "surgical",
    features: [
      "Advanced techniques",
      "Promotes healing",
      "Implant preparation",
      "Minimally invasive",
    ],
    image: "/images/services/bone-graft.jpg",
    duration: "1 visit · 60 min + healing",
    priceFrom: 400,
  },
  {
    id: 11,
    slug: "invisible-aligners",
    title: "Invisible Aligners",
    description:
      "Straighten your teeth discreetly with custom clear aligners.",
    longDescription:
      "Clear aligners straighten teeth using a series of nearly invisible, removable trays custom-made from a 3D scan of your mouth. Eat what you like, brush normally, and watch your smile move week by week — with a digital preview of the final result before you even begin.",
    category: "orthodontic",
    features: [
      "Nearly invisible",
      "Removable trays",
      "Custom-made",
      "Comfortable fit",
    ],
    image: "/images/services/aligners.jpg",
    duration: "6–18 months",
    priceFrom: 1500,
  },
  {
    id: 12,
    slug: "traditional-braces",
    title: "Traditional Braces",
    description: "Achieve a perfect smile with modern orthodontic solutions.",
    longDescription:
      "Today's braces are smaller, more comfortable, and more efficient than ever. From classic metal to discreet ceramic brackets, braces remain the most powerful tool for correcting complex alignment and bite issues — for teens and adults alike.",
    category: "orthodontic",
    features: [
      "Multiple options available",
      "Regular adjustments",
      "Effective treatment",
      "Suitable for all ages",
    ],
    image: "/images/services/braces.jpg",
    duration: "12–24 months",
    priceFrom: 1200,
  },
  {
    id: 13,
    slug: "childrens-dentistry",
    title: "Children's Dentistry",
    description:
      "Specialized dental care for our youngest patients in a friendly environment.",
    longDescription:
      "First visits shape a lifetime of dental confidence. Our team is trained to make children feel safe and even excited about the dentist — with gentle exams, fun education, fluoride protection, and parents welcome chairside at every step.",
    category: "pediatric",
    features: [
      "Child-friendly atmosphere",
      "Preventive care",
      "Early intervention",
      "Education focused",
    ],
    image: "/images/services/pediatric.jpg",
    duration: "1 visit · 30 min",
    priceFrom: 40,
  },
  {
    id: 14,
    slug: "space-maintainers",
    title: "Space Maintainers",
    description:
      "Preserve space for permanent teeth after premature loss of baby teeth.",
    longDescription:
      "When a baby tooth is lost too early, neighboring teeth can drift into the gap and block the adult tooth underneath. A small, comfortable space maintainer holds the gap open until the permanent tooth arrives — preventing crowding and possibly years of orthodontics later.",
    category: "pediatric",
    features: [
      "Custom-fitted",
      "Comfortable wear",
      "Prevents misalignment",
      "Easy maintenance",
    ],
    image: "/images/services/space-maintainers.jpg",
    duration: "2 visits · 30 min each",
    priceFrom: 150,
  },
  {
    id: 15,
    slug: "gum-disease-treatment",
    title: "Gum Disease Treatment",
    description:
      "Comprehensive treatment for various stages of periodontal disease.",
    longDescription:
      "Bleeding gums are never normal. From deep cleaning (scaling and root planing) to gentle laser therapy, we treat gum disease at every stage and set you up with a maintenance program that keeps it from coming back — protecting both your teeth and your overall health.",
    category: "periodontal",
    features: [
      "Deep cleaning",
      "Laser therapy",
      "Maintenance program",
      "Prevention focus",
    ],
    image: "/images/services/periodontal.jpg",
    duration: "1–2 visits · 60 min each",
    priceFrom: 180,
  },
  {
    id: 16,
    slug: "gum-grafting",
    title: "Gum Grafting",
    description:
      "Restore receding gums and protect exposed root surfaces.",
    longDescription:
      "Receding gums expose sensitive root surfaces and can undermine the stability of your teeth. Gum grafting rebuilds healthy tissue over these areas using delicate microsurgical techniques — reducing sensitivity, protecting against decay, and restoring a balanced, healthy smile line.",
    category: "periodontal",
    features: [
      "Natural tissue repair",
      "Reduced sensitivity",
      "Improved aesthetics",
      "Long-term results",
    ],
    image: "/images/services/gum-graft.jpg",
    duration: "1 visit · 60–90 min",
    priceFrom: 500,
  },
  {
    id: 17,
    slug: "root-canal-therapy",
    title: "Root Canal Therapy",
    description: "Save infected teeth with modern root canal treatment.",
    longDescription:
      "A modern root canal feels much like getting a filling — and it saves a tooth that would otherwise be lost. Using rotary instruments and microscope-assisted precision, we remove the infection, seal the tooth, and relieve your pain, often in a single visit.",
    category: "endodontic",
    features: [
      "Painless procedure",
      "Tooth preservation",
      "Advanced techniques",
      "Same-day treatment",
    ],
    image: "/images/services/root-canal.jpg",
    duration: "1–2 visits · 60–90 min",
    priceFrom: 300,
  },
  {
    id: 18,
    slug: "endodontic-microsurgery",
    title: "Endodontic Microsurgery",
    description:
      "Precision endodontic procedures using microscopic visualization.",
    longDescription:
      "When a conventional root canal isn't enough, microsurgery gives a failing tooth a second chance. Operating under high magnification, our endodontist can locate hidden canals, remove infected root tips, and seal the tooth with millimeter accuracy — preserving teeth that once would have been extracted.",
    category: "endodontic",
    features: [
      "High magnification",
      "Precise treatment",
      "Better outcomes",
      "Complex case handling",
    ],
    image: "/images/services/microsurgery.jpg",
    duration: "1 visit · 90 min",
    priceFrom: 600,
  },
  {
    id: 19,
    slug: "3d-cbct-imaging",
    title: "3D CBCT Imaging",
    description:
      "State-of-the-art imaging for precise diagnosis and treatment planning.",
    longDescription:
      "Cone-beam CT gives us a complete 3D picture of your teeth, roots, nerves, and jaw bone in a single 20-second scan — at a fraction of the radiation of a medical CT. It is the foundation of safe implant placement, accurate root canal diagnosis, and predictable surgical planning.",
    category: "technology",
    features: [
      "3D visualization",
      "Low radiation",
      "Detailed analysis",
      "Treatment planning",
    ],
    image: "/images/services/cbct.jpg",
    duration: "1 scan · 20 seconds",
    priceFrom: 80,
  },
  {
    id: 20,
    slug: "digital-smile-design",
    title: "Digital Smile Design",
    description:
      "Preview your new smile with advanced digital design technology.",
    longDescription:
      "See your new smile before treatment begins. Using photos, scans, and smile-design software, we simulate your final result and refine it together with you — so veneers, whitening, and alignment all work toward one agreed, predictable outcome.",
    category: "technology",
    features: [
      "Virtual preview",
      "Treatment simulation",
      "Custom planning",
      "Predictable results",
    ],
    image: "/images/services/smile-design.jpg",
    duration: "1 visit · 60 min",
    priceFrom: 100,
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getRelatedServices(service: Service, count = 3): Service[] {
  const sameCategory = services.filter(
    (s) => s.category === service.category && s.id !== service.id
  );
  const others = services.filter(
    (s) => s.category !== service.category && s.id !== service.id
  );
  return [...sameCategory, ...others].slice(0, count);
}
