import { Button } from "@workspace/ui/components/button"
import { db, pageContent } from "@workspace/db"
import { desc } from "drizzle-orm"

export default async function Page() {
  const [content] = await db
    .select()
    .from(pageContent)
    .orderBy(desc(pageContent.createdAt))
    .limit(1)

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
