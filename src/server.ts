import app from "./app";
import config from "./app/config";
import { transporter } from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { seedSuperAdmin, seedTesterAdmin, seedTesterDoctor } from "./app/utils/seed";

const PORT = config.port;

const main = async () => {
    try {
        // 1. Connect to Database
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        // FIX: Attach error listener BEFORE connecting to catch ECONNRESET runtime errors
        redisClient.on("error", (err) => {
            console.error("Redis Runtime Error:", err.message);
        });

        // 2. Connect to Redis
        await redisClient.connect();
        console.log("Connected to Redis successfully.");

        // 3. Verify Nodemailer
        await transporter.verify(); 
        console.log("Nodemailer connected successfully");

        // 4. Seed Database
        await seedSuperAdmin();
        await seedTesterAdmin();
        await seedTesterDoctor();
        
        // 5. Start Server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        // We do not disconnect Redis here because if it failed to connect, it's already closed
        process.exit(1);
    }
};

main();