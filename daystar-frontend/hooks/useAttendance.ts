"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAttendance, checkIn, checkOut, type AttendanceRecord } from "@/services/api/attendance"
import { toast } from "sonner"

export function useAttendance(date?: string) {
  return useQuery({
    queryKey: ["attendance", date],
    queryFn: () => getAttendance(date),
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: checkIn,
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to check in")
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => checkOut(id),
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to check out")
    },
  })
}
