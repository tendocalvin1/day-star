"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Babysitter } from "@/services/api/babysitters"

type BabysitterTableProps = {
  babysitters: Babysitter[]
  isLoading?: boolean
  onEdit?: (babysitter: Babysitter) => void
  onDelete?: (babysitter: Babysitter) => void
}

export function BabysitterTable({
  babysitters,
  isLoading,
  onEdit,
  onDelete,
}: BabysitterTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (babysitters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No babysitters registered yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {babysitters.map((babysitter) => (
            <TableRow key={babysitter.id}>
              <TableCell className="font-medium">
                {babysitter.first_name} {babysitter.last_name}
              </TableCell>
              <TableCell>{babysitter.phone}</TableCell>
              <TableCell>{babysitter.location || "-"}</TableCell>
              <TableCell>{babysitter.years_experience} yrs</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    babysitter.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {babysitter.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(babysitter)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && babysitter.is_active && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(babysitter)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
