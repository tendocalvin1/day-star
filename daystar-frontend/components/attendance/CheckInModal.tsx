"use client"

import { useState } from "react"
import { Baby, CalendarCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Child } from "@/services/api/children"
import { useCheckIn } from "@/hooks/useAttendance"
import { EmptyState } from "@/components/shared/EmptyState"
import { FormField, SelectInput } from "@/components/shared/FormField"
import { StatusBadge } from "@/components/shared/StatusBadge"

type CheckInModalProps = {
  isOpen: boolean
  onClose: () => void
  children: Child[]
  date: string
}

export default function CheckInModal({ isOpen, onClose, children: childList, date }: CheckInModalProps) {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  const [sessionType, setSessionType] = useState<"full_day" | "half_day">("full_day")
  const checkInMutation = useCheckIn()

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!selectedChildId) return
    checkInMutation.mutate(
      { child_id: selectedChildId, session_type: sessionType, date },
      { onSuccess: () => onClose() }
    )
  }

  const activeChildren = childList.filter((c) => c.is_active)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-100">
          <div>
            <CardTitle>Check In Child</CardTitle>
            <CardDescription className="mt-2">
              Add a child to the daily attendance record.
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close check-in modal"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {activeChildren.length === 0 ? (
            <EmptyState
              icon={Baby}
              title="No children available for check-in"
              description="Every active child appears to already be checked in for this date."
            />
          ) : (
            <>
              <FormField label="Child">
                <SelectInput
                  icon={Baby}
                  value={selectedChildId || ""}
                  onChange={(e) => setSelectedChildId(Number(e.target.value))}
                >
                  <option value="">Select a child</option>
                  {activeChildren.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.full_name}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField label="Session Type">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-indigo-600" />
                      Full Day
                    </span>
                    <input
                      type="radio"
                      value="full_day"
                      checked={sessionType === "full_day"}
                      onChange={(e) => setSessionType(e.target.value as "full_day" | "half_day")}
                      className="h-4 w-4 accent-indigo-600"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-sky-600" />
                      Half Day
                    </span>
                    <input
                      type="radio"
                      value="half_day"
                      checked={sessionType === "half_day"}
                      onChange={(e) => setSessionType(e.target.value as "full_day" | "half_day")}
                      className="h-4 w-4 accent-indigo-600"
                    />
                  </label>
                </div>
              </FormField>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-500">Selected date</span>
                <StatusBadge tone="neutral">{date}</StatusBadge>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedChildId || checkInMutation.isPending}
                  className="flex-1"
                >
                  {checkInMutation.isPending ? "Checking in..." : "Check In"}
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
