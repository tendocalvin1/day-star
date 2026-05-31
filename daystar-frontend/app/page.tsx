import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const trustItems = [
  "Role-aware staff access",
  "Daily attendance workflows",
  "Child records in one place",
];

const featureCards = [
  {
    title: "Attendance clarity",
    description: "Track check-ins and check-outs with a calm daily view built for busy front desks.",
    icon: CalendarCheck,
  },
  {
    title: "Family records",
    description: "Keep children, parent contacts, session type, and care notes organized.",
    icon: Users,
  },
  {
    title: "Secure operations",
    description: "Give managers and caregivers a focused workspace with clear access patterns.",
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/25">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">DayStar</p>
                <p className="text-xs font-medium text-slate-500">Childcare management</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>

          <div className="grid min-h-[calc(100vh-6rem)] items-center gap-10 py-12 lg:grid-cols-[1.03fr_0.97fr] lg:py-20">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Production-ready childcare operations
              </div>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-bold leading-[1.03] text-slate-950 sm:text-6xl lg:text-7xl">
                  Childcare operations that feel calm, caring, and clear.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  DayStar gives childcare teams a professional workspace for attendance, child profiles, staff access, and daily care visibility.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/login">
                    Open Workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {trustItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Today&apos;s overview</p>
                      <p className="text-xs text-slate-500">Attendance and child records</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Live
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Checked in", "24", "Children currently in care"],
                      ["Full day", "18", "Scheduled sessions"],
                      ["Open notes", "3", "Care reminders"],
                      ["Coverage", "Good", "Team capacity"],
                    ].map(([label, value, helper]) => (
                      <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
                        <p className="mt-1 text-xs text-slate-500">{helper}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-950">Care timeline</p>
                      <CalendarCheck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="space-y-3">
                      {["Morning check-ins complete", "Parent contacts verified", "Care notes reviewed"].map((item) => (
                        <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <feature.icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-950">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
