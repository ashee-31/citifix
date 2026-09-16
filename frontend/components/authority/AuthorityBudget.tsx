"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import type { BudgetEstimate } from "./types";

function formatINR(n: number): string {
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

export function BudgetSection({ budget }: { budget: BudgetEstimate[] }) {
  if (budget.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm text-white/40">No budget estimate available.</p>
      </GlassCard>
    );
  }

  const chartData = budget.map((b) => ({
    name: b.label,
    estimate: b.estimatedCostINR,
    min: b.rangeMinINR,
    max: b.rangeMaxINR,
    count: b.complaintCount,
  }));

  return (
    <GlassCard>
      <GlassCardBody>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-white">Estimated budget impact</h3>
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/30">
            AI-assisted estimate — not a confirmed quote
          </p>
        </div>

        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatINR}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "#0C0B13",
                  border: "1px solid rgba(196,168,255,0.2)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 12,
                }}
                formatter={(value: number | string, _name: string) => [`₹${Number(value).toLocaleString("en-IN")}`, _name]}
                labelStyle={{ color: "rgba(255,255,255,0.7)" }}
              />
              <Bar dataKey="estimate" fill="#C4A8FF" radius={[6, 6, 0, 0]} name="Estimate" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {budget.map((b) => (
            <div
              key={b.category}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-white">{b.label}</p>
                <span className="font-mono text-[10px] text-white/35">
                  {b.complaintCount} case{b.complaintCount !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="mt-2 font-mono text-lg font-bold text-citi-lavender">
                ₹{b.estimatedCostINR.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-white/35">
                Range ₹{b.rangeMinINR.toLocaleString("en-IN")} – ₹{b.rangeMaxINR.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/45">{b.rationale}</p>
            </div>
          ))}
        </div>
      </GlassCardBody>
    </GlassCard>
  );
}