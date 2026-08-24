import type { Metadata } from "next";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Patients",
  robots: { index: false, follow: false },
};

export default async function PatientsPage(props: PageProps<"/admin/patients">) {
  const searchParams = await props.searchParams;
  const q = (
    (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q) ?? ""
  ).trim();

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q.replace(/[^\d+]/g, "") || q } },
            { email: { contains: q.toLowerCase() } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        orderBy: [{ date: "desc" }],
        take: 1,
        select: { date: true },
      },
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-sm text-muted-foreground">
            {q ? `Search results for “${q}”` : "Most recently added"}
          </p>
        </div>
        <form className="relative" action="/admin/patients">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, email…"
            aria-label="Search patients"
            className="h-10 w-72 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>
      </div>

      <Card className="mt-6 overflow-hidden py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Last visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    {q ? "No patients match this search." : "No patients yet — they're created automatically with each booking."}
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/admin/patients/${p.id}`}
                        className="flex items-center gap-2 font-medium text-primary hover:underline"
                      >
                        <UserRound className="size-4" aria-hidden />
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{p.email ?? "—"}</TableCell>
                    <TableCell>{p._count.appointments}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.appointments[0]?.date ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}
