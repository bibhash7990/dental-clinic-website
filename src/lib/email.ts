import { site, formatSlot } from "@/data/site";

interface BookingEmailData {
  name: string;
  email: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  reference: string;
}

function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Priority: EmailJS (sends via the clinic's own connected mailbox, any
// recipient) → Resend (needs a verified domain) → console log (zero config).
export async function sendBookingConfirmation(data: BookingEmailData) {
  const common = {
    to_email: data.email,
    patient_name: data.name,
    reference: data.reference,
    service: data.serviceTitle,
    date: formatLongDate(data.date),
    time: formatSlot(data.timeSlot),
    clinic_name: site.name,
    clinic_phone: site.phone,
    clinic_address: `${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.zip}`,
  };

  if (
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY
  ) {
    return sendViaEmailJS(common);
  }

  if (process.env.RESEND_API_KEY) {
    return sendViaResend(data, common);
  }

  console.log(
    `[email:dev] To: ${data.email}\nSubject: Appointment request received — ${data.reference}\n` +
      JSON.stringify(common, null, 2)
  );
  return { sent: false as const, reason: "no-provider" };
}

async function sendViaEmailJS(params: Record<string, string>) {
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        // Private key ("accessToken") is required for server-side calls when
        // "Allow non-browser applications" alone isn't enough.
        ...(process.env.EMAILJS_PRIVATE_KEY
          ? { accessToken: process.env.EMAILJS_PRIVATE_KEY }
          : {}),
        template_params: params,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] EmailJS rejected (${res.status}): ${body}`);
      return { sent: false as const, reason: "emailjs-rejected" };
    }
    return { sent: true as const, provider: "emailjs" as const };
  } catch (err) {
    console.error("[email] EmailJS request failed", err);
    return { sent: false as const, reason: "emailjs-failed" };
  }
}

async function sendViaResend(
  data: BookingEmailData,
  params: Record<string, string>
) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: data.email,
      subject: `Appointment request received — ${data.reference}`,
      html: bookingEmailHtml(params),
    });
    return { sent: true as const, provider: "resend" as const };
  } catch (err) {
    console.error("[email] Resend failed", err);
    return { sent: false as const, reason: "resend-failed" };
  }
}

// Branded, email-client-safe HTML (tables + inline styles) used by the Resend
// path. The EmailJS path uses the same design pasted into its dashboard
// template — see emailjs-template.html in the project root.
function bookingEmailHtml(p: Record<string, string>): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f0fdfa;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdfa;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ccfbf1;">
        <tr>
          <td style="background-color:#0891b2;padding:28px 32px;text-align:center;">
            <div style="font-size:30px;line-height:1;">🦷</div>
            <div style="color:#ffffff;font-size:22px;font-weight:bold;margin-top:8px;">${p.clinic_name}</div>
            <div style="color:#cffafe;font-size:13px;margin-top:4px;">Appointment Request Received</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0;font-size:16px;color:#134e4a;">Hi <strong>${p.patient_name}</strong>,</p>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#3f6b66;">
              Thank you for booking with ${p.clinic_name}! We've received your request and our team will confirm your appointment shortly.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;">
              <tr><td style="padding:20px 24px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#0891b2;font-weight:bold;">Booking reference</div>
                <div style="font-size:26px;font-weight:bold;color:#134e4a;letter-spacing:2px;margin-top:4px;">${p.reference}</div>
              </td></tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e8f1f6;font-size:13px;color:#3f6b66;width:40%;">Treatment</td>
                <td style="padding:12px 0;border-bottom:1px solid #e8f1f6;font-size:14px;color:#134e4a;font-weight:bold;">${p.service}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e8f1f6;font-size:13px;color:#3f6b66;">Date</td>
                <td style="padding:12px 0;border-bottom:1px solid #e8f1f6;font-size:14px;color:#134e4a;font-weight:bold;">${p.date}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e8f1f6;font-size:13px;color:#3f6b66;">Time</td>
                <td style="padding:12px 0;border-bottom:1px solid #e8f1f6;font-size:14px;color:#134e4a;font-weight:bold;">${p.time}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;font-size:13px;color:#3f6b66;">Location</td>
                <td style="padding:12px 0;font-size:14px;color:#134e4a;font-weight:bold;">${p.clinic_address}</td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;">
              <tr><td style="padding:14px 18px;font-size:13px;line-height:1.6;color:#166534;">
                <strong>Before your visit:</strong> please arrive 10 minutes early and bring a photo ID and your insurance card. Need to change or cancel? Call us at <strong>${p.clinic_phone}</strong>.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color:#134e4a;padding:20px 32px;text-align:center;">
            <div style="color:#ffffff;font-size:14px;font-weight:bold;">${p.clinic_name}</div>
            <div style="color:#8fbcb6;font-size:12px;margin-top:6px;">${p.clinic_address} · ${p.clinic_phone}</div>
            <div style="color:#6a9a93;font-size:11px;margin-top:10px;">This is an automated confirmation — please do not reply to this email.</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
