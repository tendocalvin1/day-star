"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild,
  getNotCheckedIn,
  type Child,
  type GetChildrenQuery,
} from "@/services/api/children"
import { toast } from "sonner"

export function useChildren(query?: GetChildrenQuery) {
  return useQuery({
    queryKey: ["children", query],
    queryFn: () => getChildren(query),
  })
}

export function useChildById(id: number | null) {
  return useQuery({
    queryKey: ["child", id],
    queryFn: () => (id ? getChildById(id) : null),
    enabled: !!id,
  })
}

export function useCreateChild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createChild,
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["children"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to create child")
    },
  })
}

export function useUpdateChild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Child> }) =>
      updateChild(id, payload),
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["children"] })
      queryClient.invalidateQueries({ queryKey: ["child"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to update child")
    },
  })
}

export function useDeleteChild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteChild(id),
    onSuccess(data) {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["children"] })
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to deactivate child")
    },
  })
}

export function useNotCheckedIn(date?: string) {
  return useQuery({
    queryKey: ["children", "not-checked-in", date],
    queryFn: () => getNotCheckedIn(date),
  })
}
