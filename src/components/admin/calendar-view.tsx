"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  type Event as RbcEvent,
} from "react-big-calendar";
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { formatSlot } from "@/data/site";
import {
  createAdminAppointment,
  getAdminAvailability,
  rescheduleAppointment,
  searchPatients,
  updateAppointmentStatus,
} from "@/lib/actions/admin";

// ---------- types ----------

interface DentistData {
  id: string;
  name: string;
  title: string | null;
  color: string;
  availability: { weekday: number; startTime: string; endTime: string }[];
}
interface AppointmentData {
  id: string;
  reference: string;
  patientId: string | null;
  dentistId: string | null;
  name: string;
  phone: string;
  serviceTitle: string;
  serviceSlug: string;
  date: string;
  timeSlot: string;
  durationMin: number;
  status: string;
  notes: string | null;
}
interface BlockData {
  id: string;
  dentistId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}
interface CalendarViewProps {
  view: "day" | "week";
  date: string;
  dates: string[];
  selectedDentistId: string;
  dentists: DentistData[];
  appointments: AppointmentData[];
  blocks: BlockData[];
  closedDates: { date: string; reason: string | null }[];
  services: { slug: string; title: string; durationMin: number }[];
}

interface CalEvent extends RbcEvent {
  id: string;
  resourceId?: string;
  appointment?: AppointmentData;
  isBlock?: boolean;
}

// ---------- helpers ----------

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

const DnDCalendar = withDragAndDrop<CalEvent>(Calendar);

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function toDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}
function dateISO(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}
function timeHM(d: Date): string {
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}
function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return dateISO(d);
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#fef3c7", text: "#78350f" },
  CONFIRMED: { bg: "#cffafe", text: "#155e75" },
  ARRIVED: { bg: "#ede9fe", text: "#5b21b6" },
  COMPLETED: { bg: "#dcfce7", text: "#14532d" },
  NO_SHOW: { bg: "#fee2e2", text: "#7f1d1d" },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Unconfirmed",
  CONFIRMED: "Confirmed",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

// ---------- main component ----------

export function CalendarView(props: CalendarViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { view, date, dentists, services } = props;

  const [newModal, setNewModal] = useState<{
    date: string;
    time: string;
    dentistId: string;
  } | null>(null);
  const [detail, setDetail] = useState<AppointmentData | null>(null);

  const closedMap = useMemo(
    () => new Map(props.closedDates.map((c) => [c.date, c.reason])),
    [props.closedDates]
  );

  // Vertical span from availability rules (fallback 8:00–18:00)
  const [minHour, maxHour] = useMemo(() => {
    const starts = dentists.flatMap((d) => d.availability.map((a) => toMin(a.startTime)));
    const ends = dentists.flatMap((d) => d.availability.map((a) => toMin(a.endTime)));
    const start = starts.length ? Math.min(...starts) : 480;
    const end = ends.length ? Math.max(...ends) : 1080;
    return [Math.floor(start / 60), Math.min(Math.ceil(end / 60), 23)];
  }, [dentists]);

  const navigate = (params: Record<string, string>) => {
    const merged = new URLSearchParams({
      date,
      view,
      dentist: props.selectedDentistId,
      ...params,
    });
    router.push(`/admin/calendar?${merged.toString()}`);
  };

  const resources =
    view === "day"
      ? dentists.map((d) => ({ id: d.id, title: d.name }))
      : undefined;

  const events: CalEvent[] = useMemo(() => {
    const relevant =
      view === "day"
        ? props.appointments.filter((a) => a.date === date)
        : props.appointments.filter((a) => a.dentistId === props.selectedDentistId);
    return relevant.map((a) => ({
      id: a.id,
      title: `${a.name} · ${a.serviceTitle}`,
      start: toDate(a.date, a.timeSlot),
      end: new Date(toDate(a.date, a.timeSlot).getTime() + a.durationMin * 60_000),
      resourceId: view === "day" ? (a.dentistId ?? undefined) : undefined,
      appointment: a,
    }));
  }, [props.appointments, view, date, props.selectedDentistId]);

  const backgroundEvents: CalEvent[] = useMemo(() => {
    const out: CalEvent[] = [];
    for (const b of props.blocks) {
      const targets =
        view === "day"
          ? b.dentistId
            ? [b.dentistId]
            : dentists.map((d) => d.id)
          : b.dentistId === null || b.dentistId === props.selectedDentistId
            ? [undefined]
            : [];
      for (const target of targets) {
        out.push({
          id: `block-${b.id}-${target ?? "w"}`,
          title: b.reason ?? "Blocked",
          start: toDate(b.date, b.startTime),
          end: toDate(b.date, b.endTime),
          resourceId: view === "day" ? target : undefined,
          isBlock: true,
        });
      }
    }
    return out;
  }, [props.blocks, view, dentists, props.selectedDentistId]);

  const onEventDrop = (args: EventInteractionArgs<CalEvent>) => {
    const { event, start, resourceId } = args;
    if (!event.appointment) return;
    const newDate = dateISO(start as Date);
    const newTime = timeHM(start as Date);
    const newDentist =
      typeof resourceId === "string" && resourceId !== event.appointment.dentistId
        ? resourceId
        : undefined;
    startTransition(async () => {
      const result = await rescheduleAppointment(
        event.appointment!.id,
        newDate,
        newTime,
        newDentist
      );
      if (result.ok) {
        toast.success(`Rescheduled to ${newDate} ${formatSlot(newTime)}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous"
            onClick={() => navigate({ date: addDays(date, view === "day" ? -1 : -7) })}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next"
            onClick={() => navigate({ date: addDays(date, view === "day" ? 1 : 7) })}
          >
            <ChevronRight aria-hidden />
          </Button>
          <Button variant="outline" onClick={() => navigate({ date: dateISO(new Date()) })}>
            Today
          </Button>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && navigate({ date: e.target.value })}
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            aria-label="Jump to date"
          />
          {isPending && (
            <Loader2 className="size-4 animate-spin text-primary" aria-label="Saving" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {view === "week" && (
            <select
              value={props.selectedDentistId}
              onChange={(e) => navigate({ dentist: e.target.value })}
              className="h-8 cursor-pointer rounded-lg border border-input bg-background px-2 text-sm"
              aria-label="Dentist"
            >
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex rounded-lg border border-border p-0.5">
            {(["day", "week"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => navigate({ view: v })}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1 text-sm font-medium capitalize",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button
            className="bg-cta text-cta-foreground hover:bg-cta/90"
            onClick={() =>
              setNewModal({
                date,
                time: `${minHour.toString().padStart(2, "0")}:00`,
                dentistId: dentists[0]?.id ?? "",
              })
            }
          >
            <Plus aria-hidden />
            New appointment
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {Object.entries(STATUS_LABELS)
          .filter(([k]) => k !== "CANCELLED")
          .map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-sm border border-black/10"
                style={{ backgroundColor: STATUS_COLORS[key]?.bg }}
                aria-hidden
              />
              {label}
            </span>
          ))}
        <span className="ml-2">Tip: drag an appointment to reschedule it.</span>
      </div>

      {closedMap.has(date) && view === "day" && (
        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
          The clinic is closed on this date
          {closedMap.get(date) ? ` — ${closedMap.get(date)}` : ""}.
        </p>
      )}

      {/* Calendar */}
      <div className="mt-4 h-[680px]">
        <DnDCalendar
          localizer={localizer}
          date={new Date(`${date}T00:00:00`)}
          view={view as View}
          views={["day", "week"]}
          onNavigate={(d) => navigate({ date: dateISO(d) })}
          onView={(v) => navigate({ view: v })}
          toolbar={false}
          events={events}
          backgroundEvents={backgroundEvents}
          resources={resources}
          resourceIdAccessor={(r) => (r as { id: string }).id}
          resourceTitleAccessor={(r) => (r as { title: string }).title}
          step={30}
          timeslots={2}
          min={new Date(1970, 0, 1, minHour, 0)}
          max={new Date(1970, 0, 1, maxHour, 0)}
          scrollToTime={new Date(1970, 0, 1, minHour, 0)}
          selectable
          resizable={false}
          draggableAccessor={(e) => !e.isBlock}
          onSelectSlot={(slot) => {
            const start = slot.start as Date;
            setNewModal({
              date: dateISO(start),
              time: timeHM(start),
              dentistId:
                (typeof slot.resourceId === "string" && slot.resourceId) ||
                (view === "week" ? props.selectedDentistId : dentists[0]?.id) ||
                "",
            });
          }}
          onSelectEvent={(event) => {
            if (event.appointment) setDetail(event.appointment);
          }}
          onEventDrop={onEventDrop}
          eventPropGetter={(event) => {
            if (event.isBlock) {
              return {
                style: {
                  backgroundColor: "color-mix(in oklch, var(--muted-foreground), transparent 75%)",
                  color: "var(--muted-foreground)",
                },
              };
            }
            const status = event.appointment?.status ?? "PENDING";
            const colors = STATUS_COLORS[status] ?? STATUS_COLORS.PENDING;
            const dentist = dentists.find(
              (d) => d.id === event.appointment?.dentistId
            );
            return {
              style: {
                backgroundColor: colors.bg,
                color: colors.text,
                borderLeft: `4px solid ${dentist?.color ?? "var(--primary)"}`,
              },
            };
          }}
          formats={{
            timeGutterFormat: (d: Date) => format(d, "h:mm a"),
            dayFormat: (d: Date) => format(d, "EEE dd"),
            eventTimeRangeFormat: ({ start }: { start: Date }) =>
              format(start, "h:mm a"),
          }}
        />
      </div>

      {newModal && (
        <NewAppointmentModal
          initial={newModal}
          dentists={dentists}
          services={services}
          onClose={() => setNewModal(null)}
          onDone={() => {
            setNewModal(null);
            router.refresh();
          }}
        />
      )}
      {detail && (
        <AppointmentDetailModal
          appointment={detail}
          dentists={dentists}
          onClose={() => setDetail(null)}
          onDone={() => {
            setDetail(null);
            router.refresh();
          }}
        />
      )}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

// ---------- modal shell ----------

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[8vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyles =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// ---------- new appointment ----------

function NewAppointmentModal({
  initial,
  dentists,
  services,
  onClose,
  onDone,
}: {
  initial: { date: string; time: string; dentistId: string };
  dentists: DentistData[];
  services: { slug: string; title: string; durationMin: number }[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceSlug: services[0]?.slug ?? "",
    dentistId: initial.dentistId,
    date: initial.date,
    time: initial.time,
    notes: "",
    override: false,
    patientId: "",
  });
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string; phone: string; email: string | null }[]
  >([]);

  const onNameChange = (value: string) => {
    setForm((f) => ({ ...f, name: value, patientId: "" }));
    if (value.trim().length >= 2) {
      searchPatients(value).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createAdminAppointment({
        patientId: form.patientId || undefined,
        name: form.name,
        email: form.email,
        phone: form.phone,
        serviceSlug: form.serviceSlug,
        dentistId: form.dentistId,
        date: form.date,
        timeSlot: form.time,
        notes: form.notes,
        override: form.override,
      });
      if (result.ok) {
        toast.success(`Appointment booked — ${result.reference}`);
        onDone();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <ModalShell title="New appointment" onClose={onClose}>
      <div className="mt-4 space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <div className="relative">
          <Label htmlFor="na-name">Patient name</Label>
          <Input
            id="na-name"
            value={form.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Search existing or type new…"
            className="mt-1.5 h-10"
            autoFocus
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        patientId: p.id,
                        name: p.name,
                        phone: p.phone,
                        email: p.email ?? "",
                      }));
                      setSuggestions([]);
                    }}
                  >
                    <UserRound className="size-4 text-primary" aria-hidden />
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {form.patientId && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-cta">
              <Check className="size-3.5" aria-hidden /> Existing patient linked
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="na-phone">Phone</Label>
            <Input
              id="na-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1.5 h-10"
            />
          </div>
          <div>
            <Label htmlFor="na-email">Email (optional)</Label>
            <Input
              id="na-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1.5 h-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="na-service">Treatment</Label>
          <select
            id="na-service"
            value={form.serviceSlug}
            onChange={(e) => setForm((f) => ({ ...f, serviceSlug: e.target.value }))}
            className={cn(inputStyles, "mt-1.5 cursor-pointer")}
          >
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title} · {s.durationMin} min
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="na-dentist">Dentist</Label>
            <select
              id="na-dentist"
              value={form.dentistId}
              onChange={(e) => setForm((f) => ({ ...f, dentistId: e.target.value }))}
              className={cn(inputStyles, "mt-1.5 cursor-pointer")}
            >
              <option value="any">Any</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="na-date">Date</Label>
            <Input
              id="na-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="mt-1.5 h-10"
            />
          </div>
          <div>
            <Label htmlFor="na-time">Time</Label>
            <Input
              id="na-time"
              type="time"
              step={300}
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="mt-1.5 h-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="na-notes">Notes (optional)</Label>
          <Input
            id="na-notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="mt-1.5 h-10"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.override}
            onChange={(e) => setForm((f) => ({ ...f, override: e.target.checked }))}
            className="size-4 accent-[var(--primary)]"
          />
          Override schedule rules (squeeze in)
        </label>
        <Button onClick={submit} disabled={isPending} className="h-11 w-full">
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden /> Booking…
            </>
          ) : (
            "Book appointment"
          )}
        </Button>
      </div>
    </ModalShell>
  );
}

// ---------- appointment detail ----------

function AppointmentDetailModal({
  appointment,
  dentists,
  onClose,
  onDone,
}: {
  appointment: AppointmentData;
  dentists: DentistData[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(appointment.date);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dentist = dentists.find((d) => d.id === appointment.dentistId);

  const setStatus = (status: string) =>
    startTransition(async () => {
      await updateAppointmentStatus(appointment.id, status);
      onDone();
    });

  const loadSlots = (date: string) => {
    setNewDate(date);
    setSlotsLoading(true);
    getAdminAvailability(
      date,
      appointment.serviceSlug,
      appointment.dentistId ?? undefined,
      appointment.id
    )
      .then((r) => setSlots(r.closed ? [] : r.slots.map((s) => s.time)))
      .finally(() => setSlotsLoading(false));
  };

  const doReschedule = (time: string) => {
    setError(null);
    startTransition(async () => {
      const result = await rescheduleAppointment(appointment.id, newDate, time);
      if (result.ok) onDone();
      else setError(result.error);
    });
  };

  const statusActions: { label: string; status: string; variant?: "destructive" }[] =
    {
      PENDING: [
        { label: "Confirm", status: "CONFIRMED" },
        { label: "Cancel", status: "CANCELLED", variant: "destructive" as const },
      ],
      CONFIRMED: [
        { label: "Arrived", status: "ARRIVED" },
        { label: "No-show", status: "NO_SHOW", variant: "destructive" as const },
        { label: "Cancel", status: "CANCELLED", variant: "destructive" as const },
      ],
      ARRIVED: [{ label: "Complete", status: "COMPLETED" }],
      COMPLETED: [{ label: "Reopen", status: "CONFIRMED" }],
      CANCELLED: [{ label: "Reopen", status: "PENDING" }],
      NO_SHOW: [{ label: "Reopen", status: "PENDING" }],
    }[appointment.status] ?? [];

  return (
    <ModalShell title={appointment.reference} onClose={onClose}>
      <div className="mt-4 space-y-4 text-sm">
        {error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 font-medium text-destructive">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <p className="text-muted-foreground">Patient</p>
          <p className="font-medium">{appointment.name}</p>
          <p className="text-muted-foreground">Phone</p>
          <p className="font-medium">{appointment.phone}</p>
          <p className="text-muted-foreground">Treatment</p>
          <p className="font-medium">
            {appointment.serviceTitle} · {appointment.durationMin} min
          </p>
          <p className="text-muted-foreground">Dentist</p>
          <p className="font-medium">{dentist?.name ?? "—"}</p>
          <p className="text-muted-foreground">When</p>
          <p className="font-medium">
            {appointment.date} at {formatSlot(appointment.timeSlot)}
          </p>
          <p className="text-muted-foreground">Status</p>
          <p>
            <span
              className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: STATUS_COLORS[appointment.status]?.bg,
                color: STATUS_COLORS[appointment.status]?.text,
              }}
            >
              {STATUS_LABELS[appointment.status] ?? appointment.status}
            </span>
          </p>
          {appointment.notes && (
            <>
              <p className="text-muted-foreground">Notes</p>
              <p>{appointment.notes}</p>
            </>
          )}
        </div>

        {appointment.patientId && (
          <a
            href={`/admin/patients/${appointment.patientId}`}
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <UserRound className="size-4" aria-hidden />
            Open patient record
          </a>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {statusActions.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant={action.variant ?? "default"}
              disabled={isPending}
              onClick={() => setStatus(action.status)}
            >
              {action.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setRescheduling((v) => !v);
              if (!rescheduling) loadSlots(appointment.date);
            }}
          >
            Reschedule
          </Button>
        </div>

        {rescheduling && (
          <div className="rounded-xl border border-border bg-section p-4">
            <Label htmlFor="rs-date">New date</Label>
            <Input
              id="rs-date"
              type="date"
              value={newDate}
              onChange={(e) => e.target.value && loadSlots(e.target.value)}
              className="mt-1.5 h-10"
            />
            {slotsLoading ? (
              <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Checking…
              </p>
            ) : slots.length === 0 ? (
              <p className="mt-3 text-muted-foreground">No free slots on this date.</p>
            ) : (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={isPending}
                    onClick={() => doReschedule(slot)}
                    className="h-9 cursor-pointer rounded-lg border border-border bg-background text-xs font-medium hover:border-primary hover:text-primary"
                  >
                    {formatSlot(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
