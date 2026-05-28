"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Child } from "@/services/api/attendance"
import { useCheckIn } from "@/hooks/useAttendance"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Check In Child</CardTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Child</label>
            <select
              value={selectedChildId || ""}
              onChange={(e) => setSelectedChildId(parseInt(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a child</option>
              {activeChildren.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full_day"
                  checked={sessionType === "full_day"}
                  onChange={(e) => setSessionType(e.target.value as "full_day" | "half_day")}
                  className="mr-2"
                />
                Full Day
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="half_day"
                  checked={sessionType === "half_day"}
                  onChange={(e) => setSessionType(e.target.value as "full_day" | "half_day")}
                  className="mr-2"
                />
                Half Day
              </label>
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
