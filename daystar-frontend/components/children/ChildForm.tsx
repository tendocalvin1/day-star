"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Baby, CalendarDays, Mail, Phone, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Child, CreateChildPayload, UpdateChildPayload } from "@/services/api/children"
import { FormField, SelectInput, TextAreaInput, TextInput } from "@/components/shared/FormField"

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
    message: "Session type must be 'half_day' or 'full_day'",
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
      <CardHeader className="border-b border-slate-100">
        <CardTitle>{initialData ? "Edit Child" : "Register Child"}</CardTitle>
        <CardDescription>
          Capture the family, session, and care details the team needs each day.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Full Name" error={errors.full_name?.message}>
              <TextInput
                icon={Baby}
                type="text"
                placeholder="Child full name"
                hasError={!!errors.full_name}
                {...register("full_name")}
              />
            </FormField>

            <FormField label="Date of Birth" error={errors.date_of_birth?.message}>
              <TextInput
                icon={CalendarDays}
                type="date"
                hasError={!!errors.date_of_birth}
                {...register("date_of_birth")}
              />
            </FormField>

            <FormField label="Parent Name" error={errors.parent_name?.message}>
              <TextInput
                icon={User}
                type="text"
                placeholder="Parent or guardian"
                hasError={!!errors.parent_name}
                {...register("parent_name")}
              />
            </FormField>

            <FormField label="Parent Phone" error={errors.parent_phone?.message}>
              <TextInput
                icon={Phone}
                type="tel"
                {...register("parent_phone")}
                placeholder="0712345678"
                hasError={!!errors.parent_phone}
              />
            </FormField>

            <FormField label="Parent Email" error={errors.parent_email?.message} helpText="Optional">
              <TextInput
                icon={Mail}
                type="email"
                placeholder="parent@example.com"
                hasError={!!errors.parent_email}
                {...register("parent_email")}
              />
            </FormField>

            <FormField label="Session Type" error={errors.session_type?.message}>
              <SelectInput
                icon={Users}
                hasError={!!errors.session_type}
                {...register("session_type")}
              >
                <option value="full_day">Full Day</option>
                <option value="half_day">Half Day</option>
              </SelectInput>
            </FormField>
          </div>

          <FormField
            label="Special Needs"
            error={errors.special_needs?.message}
            helpText="Optional care notes, allergies, or additional context."
          >
            <TextAreaInput
              {...register("special_needs")}
              rows={3}
              placeholder="Any special needs or notes about the child"
              hasError={!!errors.special_needs}
            />
          </FormField>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
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
