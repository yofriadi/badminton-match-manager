import { db, pageContent } from "@workspace/db"

async function main() {
  console.log("Seeding database...")

  // Clear existing data
  await db.delete(pageContent)

  // Insert initial content
  const [content] = await db
    .insert(pageContent)
    .values({
      title: "Hello World",
      buttonText: "Button",
      buttonSize: "sm",
    })
    .returning()

  console.log("Seeded database with:", content)
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
