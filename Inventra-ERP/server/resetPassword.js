const prisma = require("./config/prisma");
const bcrypt = require("bcrypt");

async function resetPassword() {

    try {

        const email = "sriram@example.com";
        const password = "082008";


        // Create new bcrypt hash
        const newHash = await bcrypt.hash(password, 10);


        console.log("New Password Hash:");
        console.log(newHash);


        // Update database
        const updatedUser = await prisma.user.update({

            where: {
                email: email
            },

            data: {
                password: newHash
            }

        });


        console.log("================================");
        console.log("Password Updated Successfully");
        console.log("User:", updatedUser.email);
        console.log("================================");


    } catch(error) {

        console.log("Error:");
        console.log(error.message);

    } finally {

        await prisma.$disconnect();

    }

}


resetPassword();