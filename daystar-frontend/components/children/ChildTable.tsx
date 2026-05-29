"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Child } from "@/services/api/children"

type ChildTableProps = {
  children: Child[]
  isLoading?: boolean
  onEdit?: (child: Child) => void
  onDelete?: (child: Child) => void
  userRole?: string | null
}

export function ChildTable({
  children,
  isLoading,
  onEdit,
  onDelete,
  userRole,
}: ChildTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No children registered yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Special Needs</TableHead>
            <TableHead>Status</TableHead>
            {(userRole === "manager") && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {children.map((child) => (
            <TableRow key={child.id}>
              <TableCell className="font-medium">{child.full_name}</TableCell>
              <TableCell>{child.age}</TableCell>
              <TableCell className="capitalize">
                {child.session_type.replace("_", " ")}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{child.parent_name}</p>
                  <p className="text-sm text-gray-500">{child.parent_phone}</p>
                </div>
              </TableCell>
              <TableCell>{child.special_needs || "-"}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    child.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {child.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              {userRole === "manager" && (
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(child)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && child.is_active && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(child)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
