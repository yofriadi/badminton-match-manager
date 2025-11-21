import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

async function main() {
  const adapter = new PrismaLibSql({
    url: "file:./prisma/dev.db",
  })

  const prisma = new PrismaClient({ adapter })

  await prisma.pageContent.deleteMany()

  const content = await prisma.pageContent.create({
    data: {
      title: "Hello World",
      buttonText: "Button",
      buttonSize: "sm",
    },
  })

  console.log("Seeded database with:", content)

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
