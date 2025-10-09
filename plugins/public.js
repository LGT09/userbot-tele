const config = require("../config");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["public", "allusers"],
    run: async ({ client, message, reply, senderId }) => {
        try {
            // Only the owner can toggle public mode
            if (parseInt(senderId) !== parseInt(config.ownerId)) {
                return reply("❌ Only the owner can toggle Public mode.");
            }

            // Path to store self mode status
            const selfFile = path.resolve(__dirname, "../temp/selfMode.json");

            let selfDB = { enabled: false };
            if (fs.existsSync(selfFile)) {
                selfDB = JSON.parse(fs.readFileSync(selfFile, "utf8"));
            }

            // Disable self mode
            selfDB.enabled = false;
            fs.writeFileSync(selfFile, JSON.stringify(selfDB, null, 2), "utf8");

            reply("✅ Public mode is now ENABLED. The bot will respond to everyone.");

        } catch (error) {
            console.error("Error in public.js:", error);
            reply("❌ Failed to enable Public mode.");
        }
    },
};