"use client"

import React, { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChildTable } from "@/components/children/ChildTable"
import { ChildForm } from "@/components/children/ChildForm"
import { useAuth } from "@/hooks/useAuth"
import {
  useChildren,
  useCreateChild,
  useUpdateChild,
  useDeleteChild,
} from "@/hooks/useChildren"
import { Child } from "@/services/api/children"

export default function ChildrenPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [search, setSearch] = useState("")
  const [sessionType, setSessionType] = useState<string | undefined>()
  const [isActive, setIsActive] = useState<"true" | "false" | "all">("true")

  const { user } = useAuth()
  const { data, isLoading, error } = useChildren({
    search: search || undefined,
    session_type: sessionType as "half_day" | "full_day" | undefined,
    is_active: isActive,
  })
  const createChild = useCreateChild()
  const updateChild = useUpdateChild()
  const deleteChild = useDeleteChild()

  const handleCreate = (data: any) => {
    createChild.mutate(data, {
      onSuccess: () => {
        setShowForm(false)
      },
    })
  }

  const handleUpdate = (data: any) => {
    if (editingChild) {
      updateChild.mutate(
        { id: editingChild.id, payload: data },
        {
          onSuccess: () => {
            setShowForm(false)
            setEditingChild(null)
          },
        }
      )
    }
  }

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setShowForm(true)
  }

  const handleDelete = (child: Child) => {
    if (confirm(`Are you sure you want to deactivate ${child.full_name}?`)) {
      deleteChild.mutate(child.id)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingChild(null)
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load children</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Children</h1>
          <p className="text-gray-500 mt-1">
            {data?.total ? `Total: ${data.total} children` : "Manage registered children"}
          </p>
        </div>
        {user?.role === "manager" && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Child
          </Button>
        )}
      </div>

      {!showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search children..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <select
                value={sessionType || ""}
                onChange={(e) => setSessionType(e.target.value || undefined)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Sessions</option>
                <option value="full_day">Full Day</option>
                <option value="half_day">Half Day</option>
              </select>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value as any)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
                <option value="all">All</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm ? (
        <ChildForm
          initialData={editingChild}
          onSubmit={editingChild ? handleUpdate : handleCreate}
          isSubmitting={createChild.isPending || updateChild.isPending}
          onCancel={resetForm}
        />
      ) : (
        <Card>
          <CardContent className="p-0 pt-4">
            <ChildTable
              children={data?.data || []}
              isLoading={isLoading}
              onEdit={user?.role === "manager" ? handleEdit : undefined}
              onDelete={user?.role === "manager" ? handleDelete : undefined}
              userRole={user?.role}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
