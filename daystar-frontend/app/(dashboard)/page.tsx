"use client"

import Link from "next/link"
import {
  Baby,
  CalendarCheck,
  Clock3,
  DollarSign,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"

const stats = [
  {
    title: "Total Children",
    value: "0",
    helper: "Registered profiles",
    trend: "Ready",
    icon: Baby,
    tone: "indigo",
  },
  {
    title: "Checked In Today",
    value: "0",
    helper: "Currently in care",
    trend: "Live",
    icon: CalendarCheck,
    tone: "emerald",
  },
  {
    title: "Active Babysitters",
    value: "0",
    helper: "Available caregivers",
    trend: "Coverage",
    icon: Users,
    tone: "sky",
  },
  {
    title: "Today's Revenue",
    value: "$0",
    helper: "Recorded payments",
    trend: "Today",
    icon: DollarSign,
    tone: "amber",
  },
]

const quickActions = [
  {
    title: "Check in a child",
    description: "Start today's attendance record.",
    href: "/dashboard/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Add child profile",
    description: "Register family and care details.",
    href: "/dashboard/children",
    icon: UserPlus,
  },
  {
    title: "Review care notes",
    description: "Keep operational context visible.",
    href: "/dashboard/children",
    icon: HeartHandshake,
  },
]

const activity = [
  {
    title: "Attendance board is ready",
    description: "Check-ins and check-outs will appear here as the day starts.",
    time: "Today",
    icon: Clock3,
  },
  {
    title: "Child profiles stay organized",
    description: "Parent contacts, session type, and care needs are available in Children.",
    time: "Always on",
    icon: Baby,
  },
  {
    title: "Care operations at a glance",
    description: "Daily signals will become richer as DayStar records activity.",
    time: "Live",
    icon: Sparkles,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.email?.split("@")[0] || "there"

  return (
    <div className="daystar-page">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              DayStar care operations
            </div>
            <div className="space-y-2">
              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">
                Welcome back, {firstName}.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                A calm overview of children, attendance, caregivers, and daily revenue so the team can move through the day with confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/attendance">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Start check-in
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/children">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add child
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Today&apos;s readiness</p>
              <StatusBadge tone="success">Operational</StatusBadge>
            </div>
            <div className="space-y-3">
              {["Attendance tools online", "Children records accessible", "Secure session active"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.helper}
            trend={stat.trend}
            icon={stat.icon}
            tone={stat.tone as "indigo" | "emerald" | "sky" | "amber"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Signals from attendance, child profiles, and care operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.map((item, index) => (
                <div key={item.title} className="relative flex gap-4">
                  {index < activity.length - 1 && (
                    <span className="absolute left-5 top-10 h-full w-px bg-slate-200" />
                  )}
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-600 shadow-sm">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for the front desk and managers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-700">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950">{action.title}</p>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-slate-300 transition-colors group-hover:bg-indigo-500" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
            <CardDescription>A polished empty state until children begin checking in.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CalendarCheck}
              title="No attendance activity yet"
              description="Once the first child checks in, the daily timeline and occupancy signals will appear here."
              action={
                <Button asChild>
                  <Link href="/dashboard/attendance">Open attendance</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Care Quality</CardTitle>
            <CardDescription>Simple operational cues for a calm day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Family records", value: "Organized", color: "bg-indigo-500" },
              { label: "Attendance flow", value: "Ready", color: "bg-emerald-500" },
              { label: "Incident visibility", value: "Clear", color: "bg-sky-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-950">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 w-4/5 rounded-full ${item.color}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
