import { Button } from "@workspace/ui/components/button"
import { prisma } from "@/lib/prisma"

export default async function Page() {
  const content = await prisma.pageContent.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">No content found</h1>
          <p>Please run: pnpm db:seed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{content.title}</h1>
        <Button size={content.buttonSize as "sm" | "default" | "lg" | "icon"}>
          {content.buttonText}
        </Button>
      </div>
    </div>
  )
}
