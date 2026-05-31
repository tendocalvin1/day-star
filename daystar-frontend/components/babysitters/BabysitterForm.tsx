"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Babysitter, CreateBabysitterPayload, UpdateBabysitterPayload } from "@/services/api/babysitters"

// Match backend createBabysitterSchema
const ugandaPhoneRegex = /^(0|\+256)[0-9]{9}/

const babysitterFormSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().regex(ugandaPhoneRegex, "Enter a valid Ugandan phone number"),
    nin: z.string().min(5, "NIN must be at least 5 characters"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    skills: z.string().optional(),
    availability: z.string().optional(),
    years_experience: z.number().min(0).optional(),
    location: z.string().optional(),
    next_of_kin_name: z.string().min(2, "Next of kin name is required"),
    next_of_kin_phone: z.string().regex(ugandaPhoneRegex, "Enter a valid Ugandan phone number"),
    create_account: z.boolean().optional(),
    account_email: z.string().email().optional(),
    account_password: z.string().min(6).optional(),
  })
  .refine(
    (data) => !data.create_account || (data.account_email && data.account_password),
    { message: "Account email and password are required if creating an account", path: ["account_email"] }
  )

type BabysitterFormValues = z.infer<typeof babysitterFormSchema>

type BabysitterFormProps = {
  initialData?: Babysitter | null
  onSubmit: (data: CreateBabysitterPayload | UpdateBabysitterPayload) => void
  isSubmitting?: boolean
  onCancel?: () => void
}

export function BabysitterForm({ initialData, onSubmit, isSubmitting, onCancel }: BabysitterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BabysitterFormValues>({
    resolver: zodResolver(babysitterFormSchema),
    defaultValues: initialData
      ? {
          first_name: initialData.first_name,
          last_name: initialData.last_name,
          phone: initialData.phone,
          nin: initialData.nin,
          date_of_birth: initialData.date_of_birth,
          skills: initialData.skills?.join(", "),
          availability: initialData.availability?.join(", "),
          years_experience: initialData.years_experience,
          location: initialData.location,
          next_of_kin_name: initialData.next_of_kin_name,
          next_of_kin_phone: initialData.next_of_kin_phone,
        }
      : {
          create_account: true,
        },
  })

  const createAccount = watch("create_account")

  const handleFormSubmit = (values: BabysitterFormValues) => {
    const { skills, availability, ...rest } = values
    const payload: any = {
      ...rest,
      skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      availability: availability ? availability.split(",").map((a) => a.trim()).filter(Boolean) : [],
    }
    onSubmit(payload)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Babysitter" : "Register Babysitter"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                {...register("first_name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                {...register("last_name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="0772123456"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIN</label>
              <input
                type="text"
                {...register("nin")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.nin && <p className="text-sm text-red-600 mt-1">{errors.nin.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                {...register("date_of_birth")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.date_of_birth && <p className="text-sm text-red-600 mt-1">{errors.date_of_birth.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                {...register("years_experience", { valueAsNumber: true })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                {...register("skills")}
                placeholder="first aid, infant care"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability (comma-separated)</label>
              <input
                type="text"
                {...register("availability")}
                placeholder="weekdays, full_day"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                {...register("location")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin Name</label>
              <input
                type="text"
                {...register("next_of_kin_name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.next_of_kin_name && (
                <p className="text-sm text-red-600 mt-1">{errors.next_of_kin_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin Phone</label>
              <input
                type="tel"
                {...register("next_of_kin_phone")}
                placeholder="0701234567"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.next_of_kin_phone && (
                <p className="text-sm text-red-600 mt-1">{errors.next_of_kin_phone.message}</p>
              )}
            </div>
          </div>

          {!initialData && (
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="create_account"
                  {...register("create_account")}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <label htmlFor="create_account" className="text-sm font-medium text-gray-700">
                  Create login account
                </label>
              </div>

              {createAccount && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Email</label>
                    <input
                      type="email"
                      {...register("account_email")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    {errors.account_email && (
                      <p className="text-sm text-red-600 mt-1">{errors.account_email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Password</label>
                    <input
                      type="password"
                      {...register("account_password")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    {errors.account_password && (
                      <p className="text-sm text-red-600 mt-1">{errors.account_password.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Register"}
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
