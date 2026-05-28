"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAttendance, useChildren, useCheckIn, useCheckOut } from "@/hooks/useAttendance"
import CheckInModal from "@/components/attendance/CheckInModal"

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const { data, isLoading, error } = useAttendance(selectedDate)
  const { data: childrenData } = useChildren()
  const checkOutMutation = useCheckOut()

  const records = data?.data || []
  const summary = data?.summary

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500">Manage daily check-ins and check-outs</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <Button onClick={() => setIsCheckInModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_children}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Still In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-daystar-600">{summary.still_in}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Checked Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{summary.checked_out}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Full Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.full_day}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-daystar-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading attendance...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">Failed to load attendance</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No attendance records for this date</p>
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
                    <TableCell className="font-medium">{record.child_name}</TableCell>
                    <TableCell className="capitalize">{record.session_type.replace("_", " ")}</TableCell>
                    <TableCell>{record.check_in_time}</TableCell>
                    <TableCell>{record.check_out_time || "-"}</TableCell>
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
                          Check Out
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

      {childrenData && (
        <CheckInModal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          children={childrenData.data}
          date={selectedDate}
        />
      )}
    </div>
  )
}
