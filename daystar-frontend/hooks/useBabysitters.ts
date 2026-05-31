"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBabysitters,
  getBabysitterById,
  createBabysitter,
  updateBabysitter,
  deleteBabysitter,
  type GetBabysittersQuery,
} from "@/services/api/babysitters"
import { toast } from "sonner"

export function useBabysitters(query?: GetBabysittersQuery) {
  return useQuery({
    queryKey: ["babysitters", query],
    queryFn: () => getBabysitters(query),
  })
}

export function useBabysitterById(id: number | null) {
  return useQuery({
    queryKey: ["babysitter", id],
    queryFn: () => (id ? getBabysitterById(id) : null),
    enabled: !!id,
  })
}

export function useCreateBabysitter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBabysitter,
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["babysitters"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to create babysitter")
    },
  })
}

export function useUpdateBabysitter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updateBabysitter(id, payload),
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["babysitters"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to update babysitter")
    },
  })
}

export function useDeleteBabysitter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBabysitter,
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["babysitters"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to deactivate babysitter")
    },
  })
}
