import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How BrightSmile Dental collects, uses, stores and protects the information you give us through this website.",
};

const tel = site.phone.replace(/[^+\d]/g, "");

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="24 August 2026">
      <p className="rounded-lg bg-amber-50 p-4 text-amber-900">
        <strong>Demo notice.</strong> {site.name} is a fictional practice built
        to demonstrate a dental clinic platform. This policy describes what the
        software actually does with data, so it can be adapted for a real
        practice — it is not legal advice, and a live clinic should have it
        reviewed against the rules of its own jurisdiction.
      </p>

      <h2>What we collect</h2>
      <p>Only what a dental visit requires, and only when you give it to us:</p>
      <ul>
        <li>
          <strong>Booking an appointment</strong> — your name, email address,
          phone number, the treatment you chose, your preferred dentist, date
          and time, and any notes you add.
        </li>
        <li>
          <strong>New-patient forms</strong> — date of birth, address, emergency
          contact, medical conditions, medications, allergies, dental history
          and insurance details, plus the name you type as a signature.
        </li>
        <li>
          <strong>Contact and waitlist forms</strong> — your name, contact
          details, and the message or preferences you send.
        </li>
        <li>
          <strong>Reviews</strong> — the rating, the text, and the name you
          choose to display.
        </li>
        <li>
          <strong>Technical</strong> — your IP address is used briefly to rate
          limit form submissions and block automated abuse. We set no
          advertising or analytics cookies, and none of the booking pages carry
          tracking pixels.
        </li>
      </ul>

      <h2>Why we hold it</h2>
      <ul>
        <li>To schedule, confirm, reschedule and cancel your appointments.</li>
        <li>
          To send appointment confirmations, reminders, forms and follow-ups by
          email. Every one of those emails relates to an appointment you made —
          we do not send marketing.
        </li>
        <li>
          To let your clinical team read your medical history before treating
          you.
        </li>
        <li>
          To keep the practice&rsquo;s own records of who was seen and when.
        </li>
      </ul>

      <h2>Who can see it</h2>
      <p>
        Your records are visible to the practice&rsquo;s own staff accounts,
        each limited by role — reception staff cannot change clinical settings,
        and every change is written to an audit log with the name of whoever
        made it.
      </p>
      <p>
        Three processors are involved in running the site: our hosting
        provider, our database provider, and our email provider. They process
        data on our instructions only. We never sell your information, and we do
        not share it for advertising.
      </p>

      <h2>Cookies</h2>
      <p>
        Two, both strictly necessary and neither used for tracking: a staff
        session cookie for the admin area, and a patient session cookie set when
        you sign in to the portal. There is no third-party cookie on this site.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Appointment and clinical records are kept for as long as the practice is
        required to retain patient records. Contact-form messages, waitlist
        entries and rate-limit records are cleared once they are no longer
        needed. Rejected reviews are deleted.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us for a copy of what we hold, ask us to correct it, ask us
        to delete it where we are not required to keep it, or object to how we
        use it. You can also unsubscribe from recall reminders at any time and
        we will mark your record accordingly.
      </p>
      <p>
        To make any of these requests, email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
        <a href={`tel:${tel}`}>{site.phone}</a>.
      </p>

      <h2>Security</h2>
      <p>
        Traffic is encrypted in transit. Staff passwords are stored as salted
        hashes, never in readable form. The links in your emails are signed and
        scoped to one purpose, so a link to manage an appointment cannot be
        reused to open anything else, and portal sign-in links work once and
        expire after 20 minutes.
      </p>

      <h2>Contact</h2>
      <p>
        {site.name}, {site.address.line1}, {site.address.line2},{" "}
        {site.address.city} {site.address.zip} ·{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <p>
        See also our <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
