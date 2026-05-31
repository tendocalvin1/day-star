"use client"

import React, { useState } from "react"
import { AlertCircle, Plus, UserPlus } from "lucide-react"
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
import { Child, CreateChildPayload, UpdateChildPayload } from "@/services/api/children"
import { DataTableToolbar, SelectInput } from "@/components/shared/DataTableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"

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

  const handleCreate = (data: CreateChildPayload | UpdateChildPayload) => {
    createChild.mutate(data as CreateChildPayload, {
      onSuccess: () => {
        setShowForm(false)
      },
    })
  }

  const handleUpdate = (data: CreateChildPayload | UpdateChildPayload) => {
    if (editingChild) {
      updateChild.mutate(
        { id: editingChild.id, payload: data as UpdateChildPayload },
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
      <div className="daystar-page">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load children"
          description="Please refresh the page or adjust your filters."
          tone="danger"
        />
      </div>
    )
  }

  return (
    <div className="daystar-page">
      <PageHeader
        eyebrow="Family records"
        title={showForm ? (editingChild ? "Edit child profile" : "Register child") : "Children"}
        description={
          showForm
            ? "Keep family details, session type, and care notes accurate."
            : data?.total
            ? `${data.total} children match the current view.`
            : "Manage registered children and their care details."
        }
        actions={
          user?.role === "manager" && !showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Register Child
            </Button>
          ) : null
        }
      />

      {!showForm && (
        <DataTableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search children, parents, or phone..."
        >
          <SelectInput
            value={sessionType || ""}
            onChange={(e) => setSessionType(e.target.value || undefined)}
            className="w-full sm:w-40"
          >
            <option value="">All Sessions</option>
            <option value="full_day">Full Day</option>
            <option value="half_day">Half Day</option>
          </SelectInput>
          <SelectInput
            value={isActive}
            onChange={(e) => setIsActive(e.target.value as "true" | "false" | "all")}
            className="w-full sm:w-40"
          >
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
            <option value="all">All</option>
          </SelectInput>
        </DataTableToolbar>
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
          <CardContent className="p-0">
            <ChildTable
              children={data?.data || []}
              isLoading={isLoading}
              onEdit={user?.role === "manager" ? handleEdit : undefined}
              onDelete={user?.role === "manager" ? handleDelete : undefined}
              userRole={user?.role}
              emptyAction={
                user?.role === "manager" ? (
                  <Button onClick={() => setShowForm(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Child
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
