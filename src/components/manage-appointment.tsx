"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarPlus,
  Check,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatSlot } from "@/data/site";
import {
  cancelByToken,
  confirmByToken,
  getSlotsByToken,
  rescheduleByToken,
} from "@/lib/actions/manage";

interface ManageAppointmentProps {
  token: string;
  appointment: {
    reference: string;
    name: string;
    serviceTitle: string;
    date: string;
    timeSlot: string;
    durationMin: number;
    status: string;
    dentistName: string | null;
  };
  isPast: boolean;
  minDate: string;
  maxDate: string;
}

const STATUS_INFO: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Awaiting confirmation", className: "bg-amber-100 text-amber-900" },
  CONFIRMED: { label: "Confirmed", className: "bg-cyan-100 text-cyan-900" },
  ARRIVED: { label: "Checked in", className: "bg-violet-100 text-violet-900" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-900" },
  NO_SHOW: { label: "Missed", className: "bg-red-100 text-red-900" },
};

function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ManageAppointment({
  token,
  appointment,
  isPast,
  minDate,
  maxDate,
}: ManageAppointmentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "reschedule" | "cancel">("view");
  const [newDate, setNewDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const status = STATUS_INFO[appointment.status] ?? STATUS_INFO.PENDING;
  const canAct = !isPast && ["PENDING", "CONFIRMED"].includes(appointment.status);

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmByToken(token);
      if (result.ok) {
        setNotice("Appointment confirmed — see you soon!");
        router.refresh();
      } else setError(result.error);
    });
  };

  const cancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelByToken(token);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  };

  const loadSlots = (date: string) => {
    setNewDate(date);
    setSlots([]);
    if (!date) return;
    setSlotsLoading(true);
    getSlotsByToken(token, date)
      .then((r) => setSlots(r.slots))
      .finally(() => setSlotsLoading(false));
  };

  const reschedule = (time: string) => {
    setError(null);
    startTransition(async () => {
      const result = await rescheduleByToken(token, newDate, time);
      if (result.ok) {
        setMode("view");
        setNotice("Appointment moved — a new reminder will follow.");
        router.refresh();
      } else setError(result.error);
    });
  };

  return (
    <div className="space-y-4">
      {notice && (
        <p className="flex items-center gap-2 rounded-lg border border-cta/30 bg-cta/10 px-4 py-3 text-sm font-medium text-cta">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-sm text-muted-foreground">
              {appointment.reference}
            </p>
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", status.className)}>
              {status.label}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold">{appointment.serviceTitle}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">{formatLongDate(appointment.date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Time</dt>
              <dd className="font-medium">
                {formatSlot(appointment.timeSlot)} · {appointment.durationMin} min
              </dd>
            </div>
            {appointment.dentistName && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Dentist</dt>
                <dd className="font-medium">{appointment.dentistName}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Patient</dt>
              <dd className="font-medium">{appointment.name}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {canAct && mode === "view" && (
        <div className="flex flex-wrap gap-2">
          {appointment.status === "PENDING" && (
            <Button
              onClick={confirm}
              disabled={isPending}
              className="h-11 flex-1 bg-cta text-cta-foreground hover:bg-cta/90"
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
              Confirm appointment
            </Button>
          )}
          <Button
            variant="outline"
            className="h-11 flex-1"
            onClick={() => {
              setMode("reschedule");
              loadSlots("");
            }}
          >
            <CalendarClock aria-hidden />
            Reschedule
          </Button>
          <a
            href={`/appointment/${token}/calendar.ics`}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-sm font-medium hover:border-primary hover:text-primary"
            )}
            download
          >
            <CalendarPlus className="size-4" aria-hidden />
            Add to calendar
          </a>
          <Button
            variant="destructive"
            className="h-11 flex-1"
            onClick={() => setMode("cancel")}
          >
            <XCircle aria-hidden />
            Cancel
          </Button>
        </div>
      )}

      {mode === "reschedule" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold">Pick a new date &amp; time</h3>
            <div className="mt-3">
              <Label htmlFor="ma-date">New date</Label>
              <Input
                id="ma-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={newDate}
                onChange={(e) => loadSlots(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            {slotsLoading ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Checking availability…
              </p>
            ) : newDate && slots.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No free slots on this date — please try another day.
              </p>
            ) : slots.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={isPending}
                    onClick={() => reschedule(slot)}
                    className="h-10 cursor-pointer rounded-lg border border-border bg-background text-sm font-medium hover:border-primary hover:text-primary"
                  >
                    {formatSlot(slot)}
                  </button>
                ))}
              </div>
            ) : null}
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setMode("view")}
            >
              Keep current time
            </Button>
          </CardContent>
        </Card>
      )}

      {mode === "cancel" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold">Cancel this appointment?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your slot will be released to other patients. This can&rsquo;t be
              undone — you&rsquo;d need to book again.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={cancel}
                className="flex-1"
              >
                {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <XCircle aria-hidden />}
                Yes, cancel it
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setMode("view")}>
                Keep appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
