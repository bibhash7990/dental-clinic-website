"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const PLANS = [
  { months: 6, apr: 0, label: "6 months", note: "0% interest" },
  { months: 12, apr: 0, label: "12 months", note: "0% interest" },
  { months: 24, apr: 7.9, label: "24 months", note: "7.9% APR" },
  { months: 36, apr: 9.9, label: "36 months", note: "9.9% APR" },
];

const PRESETS = [800, 1500, 3000, 6000];

function monthlyPayment(amount: number, months: number, apr: number): number {
  if (apr === 0) return amount / months;
  const r = apr / 100 / 12;
  return (amount * r) / (1 - Math.pow(1 + r, -months));
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function FinancingCalculator() {
  const [amount, setAmount] = useState(3000);

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div>
            <Label htmlFor="treatment-cost" className="text-sm font-semibold">
              Treatment cost
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag to your estimate, or start from a typical treatment.
            </p>

            <output
              htmlFor="treatment-cost"
              className="mt-5 block font-heading text-4xl font-bold tabular-nums text-primary"
            >
              {money(amount)}
            </output>

            <input
              id="treatment-cost"
              type="range"
              min={300}
              max={12000}
              step={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
              aria-describedby="cost-hint"
            />
            <p id="cost-hint" className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>$300</span>
              <span>$12,000</span>
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  aria-pressed={amount === p}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                    amount === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {money(p)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Your monthly payment</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {PLANS.map((plan) => {
                const monthly = monthlyPayment(amount, plan.months, plan.apr);
                const total = monthly * plan.months;
                return (
                  <div
                    key={plan.months}
                    className="rounded-xl border border-border bg-section p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {plan.label}
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold tabular-nums">
                      {money(monthly)}
                      <span className="text-sm font-medium text-muted-foreground">/mo</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {plan.note} · {money(total)} total
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Illustrative figures for a demo practice. Actual plans are subject to
              approval by our third-party financing partner, and your insurance
              benefit is applied before financing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
