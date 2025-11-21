import { prisma } from "./prisma"

async function testDatabase() {
  try {
    const content = await prisma.pageContent.findFirst()
    console.log("✓ Database connection successful")
    console.log("Content:", content)
    return true
  } catch (error) {
    console.error("✗ Database connection failed:", error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
