"use client"

import React, { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BabysitterTable } from "@/components/babysitters/BabysitterTable"
import { BabysitterForm } from "@/components/babysitters/BabysitterForm"
import {
  useBabysitters,
  useCreateBabysitter,
  useUpdateBabysitter,
  useDeleteBabysitter,
} from "@/hooks/useBabysitters"
import { Babysitter } from "@/services/api/babysitters"

export default function BabysittersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingBabysitter, setEditingBabysitter] = useState<Babysitter | null>(null)
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useBabysitters({ search: search || undefined })
  const createBabysitter = useCreateBabysitter()
  const updateBabysitter = useUpdateBabysitter()
  const deleteBabysitter = useDeleteBabysitter()

  const handleCreate = (data: any) => {
    createBabysitter.mutate(data, {
      onSuccess: () => setShowForm(false),
    })
  }

  const handleUpdate = (data: any) => {
    if (editingBabysitter) {
      updateBabysitter.mutate(
        { id: editingBabysitter.id, payload: data },
        { onSuccess: () => { setShowForm(false); setEditingBabysitter(null) } }
      )
    }
  }

  const handleEdit = (babysitter: Babysitter) => {
    setEditingBabysitter(babysitter)
    setShowForm(true)
  }

  const handleDelete = (babysitter: Babysitter) => {
    if (confirm(`Are you sure you want to deactivate ${babysitter.first_name}?`)) {
      deleteBabysitter.mutate(babysitter.id)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingBabysitter(null)
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load babysitters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Babysitters</h1>
          <p className="text-gray-500 mt-1">
            {data?.total ? `Total: ${data.total} babysitters` : "Manage your team"}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Babysitter
        </Button>
      </div>

      {!showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search babysitters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm ? (
        <BabysitterForm
          initialData={editingBabysitter}
          onSubmit={editingBabysitter ? handleUpdate : handleCreate}
          isSubmitting={createBabysitter.isPending || updateBabysitter.isPending}
          onCancel={resetForm}
        />
      ) : (
        <Card>
          <CardContent className="p-0 pt-4">
            <BabysitterTable
              babysitters={data?.data || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
