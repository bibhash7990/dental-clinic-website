import { AlertTriangle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { INTAKE_LABELS } from "@/data/intake";

const ORDER = [
  "conditions",
  "otherConditions",
  "medications",
  "allergies",
  "pregnant",
  "smoker",
  "dateOfBirth",
  "physician",
  "emergencyName",
  "emergencyPhone",
  "address",
  "lastVisit",
  "anxiety",
  "dentalConcerns",
  "insuranceProvider",
  "insuranceMemberId",
  "signature",
];

const HIGHLIGHT = new Set(["conditions", "otherConditions", "medications", "allergies"]);

const VALUE_LABELS: Record<string, Record<string, string>> = {
  pregnant: { na: "Not applicable", no: "No", yes: "Yes" },
  smoker: { no: "No", occasionally: "Occasionally", daily: "Daily" },
  anxiety: { none: "Comfortable", some: "A little nervous", high: "Very anxious" },
};

function render(field: string, value: unknown): string {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None reported";
  if (value === true) return "Yes";
  if (value === false) return "No";
  const text = String(value ?? "").trim();
  return VALUE_LABELS[field]?.[text] ?? (text || "—");
}

/** Read-only view of a submitted new-patient form. */
export function IntakeSummary({
  submittedAt,
  data,
}: {
  submittedAt: Date | null;
  data: Record<string, unknown>;
}) {
  const alerts: string[] = [];
  const conditions = Array.isArray(data.conditions) ? (data.conditions as string[]) : [];
  if (conditions.length) alerts.push(...conditions);
  if (typeof data.otherConditions === "string" && data.otherConditions.trim()) {
    alerts.push(data.otherConditions.trim());
  }
  const allergies =
    typeof data.allergies === "string" ? data.allergies.trim() : "";
  const medications =
    typeof data.medications === "string" ? data.medications.trim() : "";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <ClipboardList className="size-4 text-primary" aria-hidden />
            New-patient form
          </h2>
          {submittedAt && (
            <span className="text-xs text-muted-foreground">
              submitted {submittedAt.toLocaleDateString("en-US")}
            </span>
          )}
        </div>

        {(alerts.length > 0 || allergies) && (
          <div className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              {alerts.length > 0 && (
                <p>
                  <strong>Medical:</strong> {alerts.join(", ")}
                </p>
              )}
              {allergies && (
                <p>
                  <strong>Allergies:</strong> {allergies}
                </p>
              )}
              {medications && (
                <p>
                  <strong>Medications:</strong> {medications}
                </p>
              )}
            </div>
          </div>
        )}

        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {ORDER.filter((key) => key in data).map((key) => (
            <div key={key} className={HIGHLIGHT.has(key) ? "sm:col-span-2" : ""}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {INTAKE_LABELS[key] ?? key}
              </dt>
              <dd className="text-sm">{render(key, data[key])}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
