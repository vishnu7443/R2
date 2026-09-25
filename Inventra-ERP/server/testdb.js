require("dotenv/config");
const prisma = require("./config/prisma");

async function test() {
  try {
    const user = await prisma.user.findFirst();
    console.log("DB OK:", user ? user.email : "no users yet");
  } catch (e) {
    console.error("DB ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
