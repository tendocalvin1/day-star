"use client"

import React from "react"
import { Baby } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Child } from "@/services/api/children"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"

type ChildTableProps = {
  children: Child[]
  isLoading?: boolean
  onEdit?: (child: Child) => void
  onDelete?: (child: Child) => void
  userRole?: string | null
  emptyAction?: React.ReactNode
}

export function ChildTable({
  children,
  isLoading,
  onEdit,
  onDelete,
  userRole,
  emptyAction,
}: ChildTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 rounded-md border border-slate-100 p-3 md:grid-cols-7">
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
      <div className="p-5">
        <EmptyState
          icon={Baby}
          title="No children found"
          description="Register a child or adjust the filters to find existing profiles."
          action={emptyAction}
        />
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
              <TableCell className="font-semibold text-slate-950">{child.full_name}</TableCell>
              <TableCell>{child.age}</TableCell>
              <TableCell>
                <StatusBadge tone="info">{child.session_type.replace("_", " ")}</StatusBadge>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold text-slate-800">{child.parent_name}</p>
                  <p className="text-sm text-slate-500">{child.parent_phone}</p>
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <span className="block max-w-xs truncate text-sm text-slate-600">
                  {child.special_needs || "-"}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge tone={child.is_active ? "success" : "neutral"}>
                  {child.is_active ? "Active" : "Inactive"}
                </StatusBadge>
              </TableCell>
              {userRole === "manager" && (
                <TableCell>
                  <div className="flex flex-wrap gap-2">
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
