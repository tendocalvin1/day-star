import * as React from "react"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SelectInput, TextInput } from "@/components/shared/FormField"

type DataTableToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}: DataTableToolbarProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <TextInput
              icon={Search}
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          {children && <div className="flex flex-col gap-3 sm:flex-row">{children}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

export { SelectInput }
