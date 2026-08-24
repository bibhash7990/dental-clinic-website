export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readMinutes: number;
  category: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-keep-your-teeth-white",
    title: "7 Everyday Habits That Keep Your Teeth White",
    excerpt:
      "Professional whitening gets you bright — these simple habits keep you there. Our hygienists share what actually works.",
    date: "2026-08-10",
    author: "Anna Rodriguez, RDH",
    readMinutes: 4,
    category: "Cosmetic",
    content: [
      "A bright smile isn't only about what happens in the dental chair — it's about the ninety-nine percent of the time you spend away from it. The good news: keeping your teeth white is mostly a matter of small, repeatable habits.",
      "First, rinse with water after coffee, tea, or red wine. You don't need to brush immediately (in fact, brushing right after acidic drinks can wear enamel) — a simple rinse washes away most of the pigment before it settles.",
      "Second, use a straw for iced coffee and dark sodas. It sounds trivial, but routing staining liquids past your front teeth makes a measurable difference over months.",
      "Third, brush twice daily with a soft brush and fluoride toothpaste, and don't skip flossing — plaque holds onto stains, so cleaner teeth simply stain less.",
      "Whitening toothpastes can help maintain results, but choose one with gentle polishing agents rather than harsh abrasives. If your teeth are sensitive, ask us for a recommendation at your next visit.",
      "Finally, keep your six-monthly cleanings. A professional polish removes the surface stains that home care can't reach — and it's the single best way to protect the investment you made in whitening.",
    ],
  },
  {
    slug: "what-to-expect-dental-implant",
    title: "Getting a Dental Implant: What to Expect, Step by Step",
    excerpt:
      "From the first scan to your final crown, here's the honest timeline of modern implant treatment — and why it's easier than most patients expect.",
    date: "2026-07-22",
    author: "Dr. James Chen, DMD",
    readMinutes: 6,
    category: "Restorative",
    content: [
      "The phrase 'dental implant' makes many patients nervous, but the modern procedure is remarkably routine — most people are back at work the next day. Here's what the journey actually looks like.",
      "It starts with a 3D CBCT scan. This twenty-second scan shows us your bone volume, nerve positions, and sinus anatomy, letting us plan the exact position of the implant digitally before we ever pick up an instrument.",
      "Placement day is shorter than most people expect: typically 45 to 60 minutes under local anesthetic. Most patients report less discomfort afterwards than a routine extraction, managed easily with over-the-counter pain relief.",
      "Then comes the quiet phase: over the next two to four months, the titanium post fuses with your jaw bone in a process called osseointegration. You'll have a temporary tooth in the meantime — nobody needs to know.",
      "Finally, we attach your custom ceramic crown, matched to the shade and shape of your natural teeth. From that day on, you brush and floss it like any other tooth.",
      "With good hygiene and regular check-ups, implants have a success rate above 95% at ten years — making them the closest thing modern dentistry has to growing a new tooth.",
    ],
  },
  {
    slug: "kids-first-dental-visit",
    title: "Your Child's First Dental Visit: A Parent's Guide",
    excerpt:
      "When to come, what happens, and how to make sure your child's first memory of the dentist is a happy one.",
    date: "2026-06-30",
    author: "Dr. Sarah Mitchell, DDS",
    readMinutes: 5,
    category: "Pediatric",
    content: [
      "We recommend a child's first dental visit by their first birthday, or within six months of their first tooth appearing. That surprises many parents — but early visits are less about treatment and more about building comfort.",
      "A first visit at BrightSmile is short and gentle. Your child sits on your lap or in the chair beside you while we count their teeth, check their gums, and let them touch the 'tooth mirror'. Most first visits end with a sticker, not a procedure.",
      "Before the appointment, keep your language positive and simple. Avoid words like 'hurt', 'shot', or 'drill' — even in reassurance ('it won't hurt!') they plant the idea. 'The dentist is going to count your teeth' is all a toddler needs to know.",
      "At home, start brushing as soon as the first tooth appears, using a rice-grain smear of fluoride toothpaste. From age three, upgrade to a pea-sized amount and let your child 'finish' the brushing you start.",
      "Watch the sippy cup: constant grazing on juice or milk is the leading cause of early childhood cavities. Water between meals makes a bigger difference than almost anything else.",
      "Most importantly — bring your child before anything hurts. When the dentist is a place you visit while everything is fine, there's simply nothing to fear.",
    ],
  },
  {
    slug: "bleeding-gums-what-they-mean",
    title: "Bleeding Gums Aren't Normal — Here's What They're Telling You",
    excerpt:
      "A little pink in the sink is the earliest, most reversible warning sign your mouth can give you. Don't ignore it.",
    date: "2026-06-05",
    author: "Dr. Emily Parker, DDS",
    readMinutes: 4,
    category: "Periodontal",
    content: [
      "If your gums bleed when you brush or floss, your body is sending a signal — and it's one worth listening to. Healthy gums don't bleed, no matter how firmly you floss.",
      "Bleeding is almost always the first stage of gum disease: gingivitis. Plaque along the gumline irritates the tissue, which becomes inflamed and bleeds at the slightest touch. The crucial fact: at this stage, it's completely reversible.",
      "The counterintuitive fix is to clean more, not less. Many people stop flossing when they see blood, which lets plaque accumulate and makes things worse. With proper daily flossing and brushing, bleeding typically stops within two weeks.",
      "If it doesn't, it's time to see us. Persistent bleeding can indicate periodontitis — the advanced stage where the bone supporting your teeth starts to break down. That damage isn't reversible, but it is very treatable when caught early.",
      "Gum health is also whole-body health: research links untreated gum disease to cardiovascular disease and complications in diabetes. Your gums are more connected to the rest of you than most people realize.",
      "The takeaway: a little pink in the sink is your earliest, cheapest, most fixable warning. A hygiene visit and two weeks of good flossing are usually all it takes.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
