"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import type { CategoryGrowth } from "./types";

export function CategoryGrowthSection({ growth }: { growth: CategoryGrowth[] }) {
  if (growth.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm text-white/40">No category growth data.</p>
      </GlassCard>
    );
  }

  const chartData = growth.map((g) => ({
    name: g.label,
    growth: g.growthPercent,
    current: g.currentCount,
    previous: g.previousCount,
  }));

  return (
    <GlassCard>
      <GlassCardBody>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-white">Fastest-growing categories</h3>
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/30">
            30-day vs previous period
          </p>
        </div>

        <div className="mt-6 h-56 w-full">
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
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={42}
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
                formatter={(value: number | string, _name: string) => [`${value}%`, _name]}
                labelStyle={{ color: "rgba(255,255,255,0.7)" }}
              />
              <Bar dataKey="growth" fill="#664EAE" radius={[6, 6, 0, 0]} name="Growth" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {growth.map((g) => {
            const up = g.growthPercent > 0;
            const flat = g.growthPercent === 0;
            const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
            const tone = flat ? "text-white/40" : up ? "text-emerald-400" : "text-rose-400";
            return (
              <div
                key={g.category}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{g.label}</p>
                  <p className="font-mono text-[10px] text-white/35">
                    {g.currentCount} recent · {g.previousCount} previous
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 ${tone}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="font-mono text-sm font-bold">
                    {up ? "+" : ""}
                    {g.growthPercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCardBody>
    </GlassCard>
  );
}