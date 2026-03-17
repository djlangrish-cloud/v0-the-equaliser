"use client"

import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Search } from "lucide-react"

interface AuditFormProps {
  initialUrl?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
    >
      {pending ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Analysing...
        </>
      ) : (
        "Audit Site"
      )}
    </Button>
  )
}

export function AuditForm({ initialUrl = "" }: AuditFormProps) {
  const router = useRouter()

  const handleSubmit = (formData: FormData) => {
    let url = (formData.get("url") as string)?.trim()
    if (!url) return

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    router.push(`/?url=${encodeURIComponent(url)}`)
  }

  return (
    <form action={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            name="url"
            placeholder="Enter website URL (e.g., example.com)"
            defaultValue={initialUrl}
            className="pl-10 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  )
}
