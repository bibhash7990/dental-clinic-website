import { site, formatSlot } from "@/data/site";
import { manageUrl } from "@/lib/manage-token";

// ---------------------------------------------------------------------------
// Transport: EmailJS (booking template or generic template) → Resend → console
// ---------------------------------------------------------------------------

interface GenericEmail {
  to: string;
  subject: string;
  html: string;
}

async function sendViaEmailJsTemplate(
  templateId: string,
  params: Record<string, string>
): Promise<boolean> {
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        ...(process.env.EMAILJS_PRIVATE_KEY
          ? { accessToken: process.env.EMAILJS_PRIVATE_KEY }
          : {}),
        template_params: params,
      }),
    });
    if (!res.ok) {
      console.error(`[email] EmailJS rejected (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] EmailJS request failed", err);
    return false;
  }
}

async function sendViaResend(email: GenericEmail): Promise<boolean> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: email.to,
      subject: email.subject,
      html: email.html,
    });
    return true;
  } catch (err) {
    console.error("[email] Resend failed", err);
    return false;
  }
}

const emailJsConfigured = () =>
  !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_PUBLIC_KEY);

/**
 * Generic sender used by reminders, staff notifications, and review requests.
 * EmailJS path needs EMAILJS_TEMPLATE_ID_GENERIC — a template whose body is
 * just {{{message_html}}} with To = {{to_email}} and Subject = {{subject}}.
 */
export async function sendEmail(email: GenericEmail) {
  const genericTemplate = process.env.EMAILJS_TEMPLATE_ID_GENERIC;
  if (emailJsConfigured() && genericTemplate) {
    const ok = await sendViaEmailJsTemplate(genericTemplate, {
      to_email: email.to,
      subject: email.subject,
      message_html: email.html,
    });
    if (ok) return { sent: true as const, provider: "emailjs" as const };
  }
  if (process.env.RESEND_API_KEY) {
    const ok = await sendViaResend(email);
    if (ok) return { sent: true as const, provider: "resend" as const };
  }
  console.log(`[email:dev] To: ${email.to}\nSubject: ${email.subject}\n${email.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500)}`);
  return { sent: false as const, reason: "no-provider" };
}

// ---------------------------------------------------------------------------
// Shared HTML shell (email-client safe: tables + inline styles)
// ---------------------------------------------------------------------------

function shell(headerLabel: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f0fdfa;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdfa;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ccfbf1;">
        <tr>
          <td style="background-color:#0891b2;padding:24px 32px;text-align:center;">
            <div style="font-size:28px;line-height:1;">🦷</div>
            <div style="color:#ffffff;font-size:20px;font-weight:bold;margin-top:6px;">${site.name}</div>
            <div style="color:#cffafe;font-size:13px;margin-top:4px;">${headerLabel}</div>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;">${inner}</td></tr>
        <tr>
          <td style="background-color:#134e4a;padding:18px 32px;text-align:center;">
            <div style="color:#ffffff;font-size:13px;font-weight:bold;">${site.name}</div>
            <div style="color:#8fbcb6;font-size:11px;margin-top:5px;">${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.zip} · ${site.phone}</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string, color = "#16a34a"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto 0;"><tr><td style="border-radius:10px;background-color:${color};">
    <a href="${href}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

function detailRows(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${rows
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8f1f6;font-size:13px;color:#3f6b66;width:38%;">${k}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8f1f6;font-size:14px;color:#134e4a;font-weight:bold;">${v}</td>
      </tr>`
    )
    .join("")}</table>`;
}

function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface AppointmentEmailData {
  id: string;
  name: string;
  email: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  reference: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Booking confirmation (patient) — designed EmailJS template, or shell HTML
// ---------------------------------------------------------------------------

export async function sendBookingConfirmation(data: AppointmentEmailData) {
  const manage = manageUrl(data.id);
  const params = {
    to_email: data.email,
    patient_name: data.name,
    reference: data.reference,
    service: data.serviceTitle,
    date: formatLongDate(data.date),
    time: formatSlot(data.timeSlot),
    clinic_name: site.name,
    clinic_phone: site.phone,
    clinic_address: `${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.zip}`,
    manage_url: manage,
  };

  if (emailJsConfigured() && process.env.EMAILJS_TEMPLATE_ID) {
    const ok = await sendViaEmailJsTemplate(process.env.EMAILJS_TEMPLATE_ID, params);
    if (ok) return { sent: true as const, provider: "emailjs" as const };
  }

  const html = shell(
    "Appointment Request Received",
    `<p style="margin:0;font-size:15px;color:#134e4a;">Hi <strong>${data.name}</strong>,</p>
     <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#3f6b66;">Thank you for booking with ${site.name}! We've received your request and will confirm it shortly.</p>
     ${detailRows([
       ["Reference", data.reference],
       ["Treatment", data.serviceTitle],
       ["Date", params.date],
       ["Time", params.time],
     ])}
     ${button(manage, "Manage appointment", "#0891b2")}
     <p style="margin:14px 0 0;font-size:12px;color:#3f6b66;text-align:center;">Confirm, reschedule, cancel, or add to your calendar from the link above.</p>`
  );
  return sendEmail({
    to: data.email,
    subject: `Appointment request received — ${data.reference}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// Reminders (patient)
// ---------------------------------------------------------------------------

export async function sendReminder(
  data: AppointmentEmailData,
  kind: "72h" | "24h"
) {
  const manage = manageUrl(data.id);
  const lead = kind === "72h" ? "coming up in a few days" : "tomorrow";
  const confirmNote =
    data.status === "PENDING"
      ? `<p style="margin:14px 0 0;font-size:13px;color:#78350f;background:#fef3c7;border-radius:8px;padding:10px 14px;">Your appointment is <strong>not confirmed yet</strong> — please confirm it with one click below.</p>`
      : "";
  const html = shell(
    "Appointment Reminder",
    `<p style="margin:0;font-size:15px;color:#134e4a;">Hi <strong>${data.name}</strong>,</p>
     <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#3f6b66;">A friendly reminder that your appointment is ${lead}.</p>
     ${confirmNote}
     ${detailRows([
       ["Treatment", data.serviceTitle],
       ["Date", formatLongDate(data.date)],
       ["Time", formatSlot(data.timeSlot)],
       ["Reference", data.reference],
     ])}
     ${button(manage, data.status === "PENDING" ? "Confirm appointment" : "Manage appointment")}
     <p style="margin:14px 0 0;font-size:12px;color:#3f6b66;text-align:center;">Can't make it? Use the same link to reschedule or cancel — it helps us offer the slot to someone else.</p>`
  );
  return sendEmail({
    to: data.email,
    subject:
      kind === "24h"
        ? `Reminder: your appointment is tomorrow at ${formatSlot(data.timeSlot)}`
        : `Upcoming appointment on ${formatLongDate(data.date)}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// Staff notifications
// ---------------------------------------------------------------------------

function clinicNotifyAddress(): string | null {
  return process.env.CLINIC_NOTIFY_EMAIL ?? null;
}

export async function sendClinicNewBookingAlert(data: AppointmentEmailData & { phone: string; createdBy: string }) {
  const to = clinicNotifyAddress();
  if (!to) return { sent: false as const, reason: "not-configured" };
  const html = shell(
    "New Online Booking",
    `<p style="margin:0;font-size:14px;color:#134e4a;">A new appointment request just arrived.</p>
     ${detailRows([
       ["Patient", data.name],
       ["Phone", data.phone],
       ["Email", data.email],
       ["Treatment", data.serviceTitle],
       ["Date", formatLongDate(data.date)],
       ["Time", formatSlot(data.timeSlot)],
       ["Reference", data.reference],
     ])}
     ${button(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin`, "Open admin dashboard", "#0891b2")}`
  );
  return sendEmail({
    to,
    subject: `New booking: ${data.name} — ${formatLongDate(data.date)} ${formatSlot(data.timeSlot)}`,
    html,
  });
}

export async function sendDailyDigest(
  rows: { time: string; name: string; phone: string; service: string; dentist: string; status: string }[],
  dateISO: string
) {
  const to = clinicNotifyAddress();
  if (!to) return { sent: false as const, reason: "not-configured" };
  const table =
    rows.length === 0
      ? `<p style="margin:14px 0 0;font-size:14px;color:#3f6b66;">No appointments scheduled today.</p>`
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:13px;">
          <tr>
            ${["Time", "Patient", "Treatment", "Dentist", "Status"]
              .map((h) => `<th align="left" style="padding:8px 6px;border-bottom:2px solid #ccfbf1;color:#0891b2;font-size:11px;text-transform:uppercase;">${h}</th>`)
              .join("")}
          </tr>
          ${rows
            .map(
              (r) => `<tr>
                <td style="padding:8px 6px;border-bottom:1px solid #e8f1f6;font-weight:bold;color:#134e4a;">${r.time}</td>
                <td style="padding:8px 6px;border-bottom:1px solid #e8f1f6;color:#134e4a;">${r.name}<br><span style="color:#3f6b66;font-size:11px;">${r.phone}</span></td>
                <td style="padding:8px 6px;border-bottom:1px solid #e8f1f6;color:#134e4a;">${r.service}</td>
                <td style="padding:8px 6px;border-bottom:1px solid #e8f1f6;color:#134e4a;">${r.dentist}</td>
                <td style="padding:8px 6px;border-bottom:1px solid #e8f1f6;color:#134e4a;">${r.status}</td>
              </tr>`
            )
            .join("")}
        </table>`;
  const html = shell(
    "Today's Schedule",
    `<p style="margin:0;font-size:14px;color:#134e4a;"><strong>${formatLongDate(dateISO)}</strong> — ${rows.length} appointment${rows.length === 1 ? "" : "s"}.</p>${table}`
  );
  return sendEmail({ to, subject: `Today's schedule — ${rows.length} appointments (${dateISO})`, html });
}

// ---------------------------------------------------------------------------
// Review request (patient, after completed visit)
// ---------------------------------------------------------------------------

export async function sendReviewRequest(data: AppointmentEmailData) {
  const reviewUrl = process.env.GOOGLE_REVIEW_URL;
  if (!reviewUrl) return { sent: false as const, reason: "not-configured" };
  const html = shell(
    "Thank You for Visiting",
    `<p style="margin:0;font-size:15px;color:#134e4a;">Hi <strong>${data.name}</strong>,</p>
     <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#3f6b66;">Thank you for visiting ${site.name} today — we hope everything went smoothly with your ${data.serviceTitle.toLowerCase()}.</p>
     <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#3f6b66;">If you have a minute, a quick review helps other patients find us and means a lot to our small team.</p>
     ${button(reviewUrl, "Leave a review ★")}
     <p style="margin:14px 0 0;font-size:12px;color:#3f6b66;text-align:center;">Had a problem? Please call us at ${site.phone} — we'd like to make it right.</p>`
  );
  return sendEmail({ to: data.email, subject: `How was your visit to ${site.name}?`, html });
}
