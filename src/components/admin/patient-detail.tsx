"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addPatientNote, updatePatient } from "@/lib/actions/admin";

export function PatientEditor({
  patient,
}: {
  patient: { id: string; name: string; phone: string; email: string; dateOfBirth: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(patient);

  const save = () =>
    startTransition(async () => {
      await updatePatient(patient.id, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h2 className="font-semibold">Contact details</h2>
        <div>
          <Label htmlFor="pe-name">Name</Label>
          <Input
            id="pe-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1.5 h-10"
          />
        </div>
        <div>
          <Label htmlFor="pe-phone">Phone</Label>
          <Input
            id="pe-phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="mt-1.5 h-10"
          />
        </div>
        <div>
          <Label htmlFor="pe-email">Email</Label>
          <Input
            id="pe-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1.5 h-10"
          />
        </div>
        <div>
          <Label htmlFor="pe-dob">Date of birth</Label>
          <Input
            id="pe-dob"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            className="mt-1.5 h-10"
          />
        </div>
        <Button onClick={save} disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden /> Saving…
            </>
          ) : saved ? (
            "Saved ✓"
          ) : (
            <>
              <Save aria-hidden /> Save changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PatientNotes({
  patientId,
  notes,
}: {
  patientId: string;
  notes: { id: string; authorName: string; text: string; createdAt: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");

  const add = () =>
    startTransition(async () => {
      await addPatientNote(patientId, text);
      setText("");
    });

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <StickyNote className="size-4 text-primary" aria-hidden />
          Notes
        </h2>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Add a note about this patient…"
          aria-label="New note"
        />
        <Button
          onClick={add}
          disabled={isPending || !text.trim()}
          variant="secondary"
          className="w-full"
        >
          {isPending ? "Adding…" : "Add note"}
        </Button>
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-border bg-section p-3">
              <p className="text-sm">{n.text}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {n.authorName} · {n.createdAt}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
