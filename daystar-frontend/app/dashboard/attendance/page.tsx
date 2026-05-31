"use client"

import { useState } from "react"
import { AlertCircle, Baby, CalendarCheck, Clock3, LogOut, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAttendance, useCheckOut } from "@/hooks/useAttendance"
import { useNotCheckedIn } from "@/hooks/useChildren"
import CheckInModal from "@/components/attendance/CheckInModal"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TextInput } from "@/components/shared/FormField"

function AttendanceTableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 rounded-md border border-slate-100 p-3 md:grid-cols-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const { data, isLoading, error } = useAttendance(selectedDate)
  const { data: notCheckedInData } = useNotCheckedIn(selectedDate)
  const checkOutMutation = useCheckOut()

  const records = data?.data || []
  const summary = data?.summary

  return (
    <div className="daystar-page">
      <PageHeader
        eyebrow="Daily operations"
        title="Attendance"
        description="Manage daily check-ins, check-outs, and care occupancy from one focused workspace."
        actions={
          <>
            <TextInput
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto"
            />
            <Button onClick={() => setIsCheckInModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Check In
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Children"
          value={summary?.total_children ?? 0}
          description="Attendance records"
          icon={Baby}
          tone="indigo"
          isLoading={isLoading}
        />
        <StatCard
          title="Still In"
          value={summary?.still_in ?? 0}
          description="Currently checked in"
          icon={Users}
          tone="emerald"
          isLoading={isLoading}
        />
        <StatCard
          title="Checked Out"
          value={summary?.checked_out ?? 0}
          description="Completed care today"
          icon={LogOut}
          tone="slate"
          isLoading={isLoading}
        />
        <StatCard
          title="Full Day"
          value={summary?.full_day ?? 0}
          description="Full-day sessions"
          icon={Clock3}
          tone="sky"
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Daily attendance for the selected date.</CardDescription>
            </div>
            <StatusBadge tone={records.length ? "success" : "neutral"}>
              {records.length} records
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <AttendanceTableSkeleton />
          ) : error ? (
            <div className="p-5">
              <EmptyState
                icon={AlertCircle}
                title="Failed to load attendance"
                description="Please refresh or try another date."
                tone="danger"
              />
            </div>
          ) : records.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={CalendarCheck}
                title="No attendance records for this date"
                description="Start the first check-in to build today's attendance timeline."
                action={
                  <Button onClick={() => setIsCheckInModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child Name</TableHead>
                  <TableHead>Session Type</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Babysitter</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-semibold text-slate-950">{record.child_name}</TableCell>
                    <TableCell>
                      <StatusBadge tone="info">{record.session_type.replace("_", " ")}</StatusBadge>
                    </TableCell>
                    <TableCell className="font-medium">{record.check_in_time}</TableCell>
                    <TableCell>
                      {record.check_out_time ? (
                        <span className="font-medium">{record.check_out_time}</span>
                      ) : (
                        <StatusBadge tone="success">Still in</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.babysitter_first_name ? `${record.babysitter_first_name} ${record.babysitter_last_name}` : "-"}
                    </TableCell>
                    <TableCell>
                      {!record.check_out_time && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkOutMutation.mutate({ id: record.id })}
                          disabled={checkOutMutation.isPending}
                        >
                          {checkOutMutation.isPending ? "Checking out..." : "Check Out"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {notCheckedInData && (
        <CheckInModal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          children={notCheckedInData.data}
          date={selectedDate}
        />
      )}
    </div>
  )
}
