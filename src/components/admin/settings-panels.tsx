"use client";

import { useState, useTransition } from "react";
import { CalendarOff, Clock3, Loader2, Plus, Stethoscope, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addClosedDate,
  addTimeBlock,
  removeClosedDate,
  removeTimeBlock,
  saveDentistHours,
  saveService,
  saveStaffUser,
} from "@/lib/actions/admin";

const inputStyles =
  "h-9 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function PanelCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon className="size-4 text-primary" aria-hidden />
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-4">{children}</div>
      </CardContent>
    </Card>
  );
}

// ---------- Closed dates ----------

export function ClosedDatesPanel({
  closedDates,
}: {
  closedDates: { id: string; date: string; reason: string | null }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  return (
    <PanelCard
      icon={CalendarOff}
      title="Closed dates & holidays"
      subtitle="The clinic takes no bookings on these dates."
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Closed date"
          className={inputStyles}
        />
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (e.g. Public holiday)"
          className="h-9 w-56"
        />
        <Button
          size="sm"
          disabled={isPending || !date}
          onClick={() =>
            startTransition(async () => {
              await addClosedDate(date, reason);
              setDate("");
              setReason("");
            })
          }
        >
          <Plus aria-hidden /> Add
        </Button>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {closedDates.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-2 rounded-full border border-border bg-section px-3 py-1 text-sm"
          >
            <span className="font-medium">{c.date}</span>
            {c.reason && <span className="text-muted-foreground">{c.reason}</span>}
            <button
              type="button"
              aria-label={`Remove closed date ${c.date}`}
              disabled={isPending}
              onClick={() => startTransition(() => removeClosedDate(c.id))}
              className="cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ---------- Time blocks ----------

export function TimeBlocksPanel({
  dentists,
  blocks,
}: {
  dentists: { id: string; name: string }[];
  blocks: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string | null;
    dentistName: string;
  }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    dentistId: "",
    date: "",
    startTime: "12:00",
    endTime: "13:00",
    reason: "",
  });

  return (
    <PanelCard
      icon={Clock3}
      title="Time off & blocks"
      subtitle="Block lunch breaks, meetings, or time off — for one dentist or the whole clinic."
    >
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={form.dentistId}
          onChange={(e) => setForm((f) => ({ ...f, dentistId: e.target.value }))}
          aria-label="Dentist"
          className={cn(inputStyles, "cursor-pointer")}
        >
          <option value="">Whole clinic</option>
          {dentists.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          aria-label="Date"
          className={inputStyles}
        />
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          aria-label="Start time"
          className={inputStyles}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          aria-label="End time"
          className={inputStyles}
        />
        <Input
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          placeholder="Reason"
          className="h-9 w-40"
        />
        <Button
          size="sm"
          disabled={isPending || !form.date}
          onClick={() =>
            startTransition(async () => {
              await addTimeBlock(form);
              setForm((f) => ({ ...f, date: "", reason: "" }));
            })
          }
        >
          <Plus aria-hidden /> Block
        </Button>
      </div>
      <ul className="mt-3 space-y-1.5">
        {blocks.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-section px-3 py-1.5 text-sm"
          >
            <span className="font-medium">{b.date}</span>
            <span>
              {b.startTime}–{b.endTime}
            </span>
            <span className="text-muted-foreground">{b.dentistName}</span>
            {b.reason && <span className="text-muted-foreground">· {b.reason}</span>}
            <button
              type="button"
              aria-label="Remove block"
              disabled={isPending}
              onClick={() => startTransition(() => removeTimeBlock(b.id))}
              className="ml-auto cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ---------- Services ----------

export function ServicesPanel({
  services,
}: {
  services: {
    id: string;
    title: string;
    category: string;
    durationMin: number;
    price: number;
    active: boolean;
  }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [edited, setEdited] = useState<Record<string, { durationMin: number; price: number; active: boolean }>>({});

  const rowState = (s: (typeof services)[number]) =>
    edited[s.id] ?? { durationMin: s.durationMin, price: s.price, active: s.active };

  return (
    <PanelCard
      icon={Stethoscope}
      title="Treatments & pricing"
      subtitle="Duration drives the calendar and slot engine; price shows on the website."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">Treatment</th>
              <th className="py-2 pr-3 font-semibold">Duration (min)</th>
              <th className="py-2 pr-3 font-semibold">Price from ($)</th>
              <th className="py-2 pr-3 font-semibold">Bookable</th>
              <th className="py-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const state = rowState(s);
              const dirty =
                state.durationMin !== s.durationMin ||
                state.price !== s.price ||
                state.active !== s.active;
              return (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{s.category}</p>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min={15}
                      max={240}
                      step={15}
                      value={state.durationMin}
                      aria-label={`${s.title} duration`}
                      onChange={(e) =>
                        setEdited((prev) => ({
                          ...prev,
                          [s.id]: { ...state, durationMin: Number(e.target.value) },
                        }))
                      }
                      className={cn(inputStyles, "w-20")}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min={0}
                      value={state.price}
                      aria-label={`${s.title} price`}
                      onChange={(e) =>
                        setEdited((prev) => ({
                          ...prev,
                          [s.id]: { ...state, price: Number(e.target.value) },
                        }))
                      }
                      className={cn(inputStyles, "w-24")}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={state.active}
                      aria-label={`${s.title} bookable`}
                      onChange={(e) =>
                        setEdited((prev) => ({
                          ...prev,
                          [s.id]: { ...state, active: e.target.checked },
                        }))
                      }
                      className="size-4 accent-[var(--primary)]"
                    />
                  </td>
                  <td className="py-2 text-right">
                    {dirty && (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await saveService({
                              id: s.id,
                              title: s.title,
                              category: s.category,
                              ...state,
                            });
                            setEdited((prev) => {
                              const next = { ...prev };
                              delete next[s.id];
                              return next;
                            });
                          })
                        }
                      >
                        {isPending ? <Loader2 className="animate-spin" aria-hidden /> : "Save"}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

// ---------- Working hours ----------

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function HoursPanel({
  dentists,
}: {
  dentists: {
    id: string;
    name: string;
    availability: { weekday: number; startTime: string; endTime: string }[];
  }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(dentists[0]?.id ?? "");
  const dentist = dentists.find((d) => d.id === selected);

  const [rules, setRules] = useState<Record<number, { on: boolean; start: string; end: string }>>(
    () => initRules(dentists[0])
  );

  function initRules(d?: (typeof dentists)[number]) {
    const map: Record<number, { on: boolean; start: string; end: string }> = {};
    for (let wd = 0; wd < 7; wd++) {
      const rule = d?.availability.find((a) => a.weekday === wd);
      map[wd] = rule
        ? { on: true, start: rule.startTime, end: rule.endTime }
        : { on: false, start: "09:00", end: "17:00" };
    }
    return map;
  }

  const save = () =>
    startTransition(async () => {
      await saveDentistHours(
        selected,
        Object.entries(rules)
          .filter(([, r]) => r.on)
          .map(([wd, r]) => ({
            weekday: Number(wd),
            startTime: r.start,
            endTime: r.end,
          }))
      );
    });

  return (
    <PanelCard
      icon={Clock3}
      title="Working hours"
      subtitle="Weekly schedule per dentist — the booking engine only offers these windows."
    >
      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          setRules(initRules(dentists.find((d) => d.id === e.target.value)));
        }}
        aria-label="Dentist"
        className={cn(inputStyles, "cursor-pointer")}
      >
        {dentists.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {dentist && (
        <div className="mt-3 space-y-2">
          {WEEKDAYS.map((label, wd) => (
            <div key={wd} className="flex flex-wrap items-center gap-3">
              <label className="flex w-32 cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={rules[wd]?.on ?? false}
                  onChange={(e) =>
                    setRules((prev) => ({
                      ...prev,
                      [wd]: { ...prev[wd], on: e.target.checked },
                    }))
                  }
                  className="size-4 accent-[var(--primary)]"
                />
                {label}
              </label>
              {rules[wd]?.on ? (
                <>
                  <input
                    type="time"
                    value={rules[wd].start}
                    aria-label={`${label} start`}
                    onChange={(e) =>
                      setRules((prev) => ({
                        ...prev,
                        [wd]: { ...prev[wd], start: e.target.value },
                      }))
                    }
                    className={inputStyles}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={rules[wd].end}
                    aria-label={`${label} end`}
                    onChange={(e) =>
                      setRules((prev) => ({
                        ...prev,
                        [wd]: { ...prev[wd], end: e.target.value },
                      }))
                    }
                    className={inputStyles}
                  />
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Off</span>
              )}
            </div>
          ))}
          <Button onClick={save} disabled={isPending} className="mt-2">
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Saving…
              </>
            ) : (
              "Save hours"
            )}
          </Button>
        </div>
      )}
    </PanelCard>
  );
}

// ---------- Staff ----------

export function StaffPanel({
  staff,
}: {
  staff: { id: string; email: string; name: string; role: string; active: boolean }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "RECEPTIONIST",
    password: "",
  });

  return (
    <PanelCard
      icon={Users}
      title="Staff accounts"
      subtitle="Owner sees everything; receptionists manage the calendar and patients; dentists see their own schedule."
    >
      <ul className="space-y-1.5">
        {staff.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-section px-3 py-2 text-sm"
          >
            <span className="font-medium">{u.name}</span>
            <span className="text-muted-foreground">{u.email}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
              {u.role.toLowerCase()}
            </span>
            {!u.active && (
              <span className="text-xs font-medium text-destructive">disabled</span>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() =>
                  saveStaffUser({
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    role: u.role,
                    active: !u.active,
                  })
                )
              }
              className="ml-auto cursor-pointer text-xs font-medium text-muted-foreground hover:text-primary"
            >
              {u.active ? "Disable" : "Enable"}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Name"
          className="h-9 w-36"
        />
        <Input
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="Email"
          type="email"
          className="h-9 w-52"
        />
        <select
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          aria-label="Role"
          className={cn(inputStyles, "cursor-pointer")}
        >
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="DENTIST">Dentist</option>
          <option value="OWNER">Owner</option>
        </select>
        <Input
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="Password"
          type="password"
          className="h-9 w-36"
        />
        <Button
          size="sm"
          disabled={isPending || !form.email || !form.name || !form.password}
          onClick={() =>
            startTransition(async () => {
              await saveStaffUser({ ...form, active: true });
              setForm({ email: "", name: "", role: "RECEPTIONIST", password: "" });
            })
          }
        >
          <Plus aria-hidden /> Add staff
        </Button>
      </div>
    </PanelCard>
  );
}
