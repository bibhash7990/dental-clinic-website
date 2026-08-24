import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that apply when you use the BrightSmile Dental website to book appointments, complete forms or leave a review.",
};

const tel = site.phone.replace(/[^+\d]/g, "");

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Use" updated="24 August 2026">
      <p className="rounded-lg bg-amber-50 p-4 text-amber-900">
        <strong>Demo notice.</strong> {site.name} is a fictional practice. The
        clinic, its dentists, its testimonials and its prices are all invented
        to demonstrate a dental clinic platform. Nothing here is a real offer of
        dental treatment.
      </p>

      <h2>Not medical advice</h2>
      <p>
        The treatment descriptions and articles on this site are general
        information. They are not a diagnosis and cannot replace an
        examination. Never delay seeking care because of something you read
        here.
      </p>
      <p>
        <strong>
          If you have severe pain, facial swelling, uncontrolled bleeding or
          difficulty breathing or swallowing, do not use this website — call{" "}
          <a href={`tel:${tel}`}>{site.phone}</a> or your local emergency
          number.
        </strong>
      </p>

      <h2>Booking an appointment</h2>
      <ul>
        <li>
          A booking is a <strong>request</strong> until the practice confirms
          it. You will get an email either way.
        </li>
        <li>
          Prices shown are starting prices for a standard case. Your written
          treatment plan may differ once a dentist has examined you, and you
          will always see the final figure before treatment begins.
        </li>
        <li>
          Please give us as much notice as you can if you cannot attend — every
          confirmation and reminder email contains a link to reschedule or
          cancel, and the freed slot is offered to patients on the waitlist.
        </li>
        <li>
          Repeatedly missing appointments without notice may mean we ask for a
          deposit before booking again.
        </li>
      </ul>

      <h2>Information you give us</h2>
      <p>
        Please keep your medical history accurate and complete — your clinical
        team relies on it, particularly the allergy and medication sections.
        Tell us about anything that changes before your visit.
      </p>

      <h2>Reviews</h2>
      <p>
        Reviews are invited by email after a completed visit, so every one comes
        from someone we actually treated. We publish them as written and we do
        not edit them. We will decline to publish content that is unlawful,
        abusive, or identifies another patient. Submitting a review with the
        consent box ticked gives us permission to display it, with the name you
        chose, on this site.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not attempt to access accounts or records that are not yours, submit
        forms automatically, or interfere with the operation of the site. Form
        submissions are rate limited and abuse may be blocked.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep the site available but do not guarantee uninterrupted
        access. Features may change. If online booking is unavailable, please
        call the practice.
      </p>

      <h2>Content</h2>
      <p>
        The text, design and images on this site belong to {site.name} or are
        licensed to it. Please do not reproduce them without permission.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> ·{" "}
        <a href={`tel:${tel}`}>{site.phone}</a>
      </p>
      <p>
        See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
