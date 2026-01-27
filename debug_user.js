const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = "cmkwiudeh0000a8fz3yq8xxse"; // ID from the token
    console.log(`Checking for user with ID: ${userId}`);
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (user) {
        console.log("User found:", user);
    } else {
        console.log("User NOT found");
        // List all users to see if there are any
        const users = await prisma.user.findMany();
        console.log("Total users in DB:", users.length);
        if (users.length > 0) {
            console.log("First user ID:", users[0].id);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
