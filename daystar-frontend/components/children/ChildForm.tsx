"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Child, CreateChildPayload, UpdateChildPayload } from "@/services/api/children"

// Replicate backend's createChildSchema
const ugandaPhoneRegex = /^(0|\+256)[0-9]{9}$/
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

const childFormSchema = z.object({
  full_name: z.string().min(2).max(200).trim(),
  date_of_birth: z.string().regex(isoDateRegex, "Date must be YYYY-MM-DD"),
  parent_name: z.string().min(2).max(200).trim(),
  parent_phone: z.string().regex(ugandaPhoneRegex, "Enter a valid Uganda phone (e.g. 0712345678)"),
  parent_email: z.string().email().optional().nullable(),
  session_type: z.enum(["half_day", "full_day"], {
    errorMap: () => ({ message: "Session type must be 'half_day' or 'full_day'" }),
  }),
  special_needs: z.string().max(1000).optional().nullable(),
})

type ChildFormValues = z.infer<typeof childFormSchema>

type ChildFormProps = {
  initialData?: Child | null
  onSubmit: (data: CreateChildPayload | UpdateChildPayload) => void
  isSubmitting?: boolean
  onCancel?: () => void
}

export function ChildForm({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}: ChildFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: initialData
      ? {
          full_name: initialData.full_name,
          date_of_birth: initialData.date_of_birth,
          parent_name: initialData.parent_name,
          parent_phone: initialData.parent_phone,
          parent_email: initialData.parent_email,
          session_type: initialData.session_type,
          special_needs: initialData.special_needs,
        }
      : {
          session_type: "full_day",
        },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Child" : "Register Child"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register("full_name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-daystar-500 focus:border-daystar-500"
              />
              {errors.full_name && (
                <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                {...register("date_of_birth")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-daystar-500 focus:border-daystar-500"
              />
              {errors.date_of_birth && (
                <p className="text-sm text-red-600 mt-1">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Name
              </label>
              <input
                type="text"
                {...register("parent_name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-daystar-500 focus:border-daystar-500"
              />
              {errors.parent_name && (
                <p className="text-sm text-red-600 mt-1">{errors.parent_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Phone
              </label>
              <input
                type="tel"
                {...register("parent_phone")}
                placeholder="0712345678"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-daystar-500 focus:border-daystar-500"
              />
              {errors.parent_phone && (
                <p className="text-sm text-red-600 mt-1">{errors.parent_phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Email (Optional)
              </label>
              <input
                type="email"
                {...register("parent_email")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-daystar-500 focus:border-daystar-500"
              />
              {errors.parent_email && (
                <p className="text-sm text-red-600 mt-1">{errors.parent_email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Type
              </label>
              <select
                {...register("session_type")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-daystar-500 focus:border-daystar-500"
              >
                <option value="full_day">Full Day</option>
                <option value="half_day">Half Day</option>
              </select>
              {errors.session_type && (
                <p className="text-sm text-red-600 mt-1">{errors.session_type.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Needs (Optional)
            </label>
            <textarea
              {...register("special_needs")}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-daystar-500 focus:border-daystar-500"
              placeholder="Any special needs or notes about the child"
            />
            {errors.special_needs && (
              <p className="text-sm text-red-600 mt-1">{errors.special_needs.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? initialData
                  ? "Saving..."
                  : "Registering..."
                : initialData
                ? "Save Changes"
                : "Register Child"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
