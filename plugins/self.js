const config = require("../config");

module.exports = {
    command: ["self", "owneronly"],
    run: async ({ client, message, reply, text, senderId }) => {
        try {
            // Only owner can toggle self mode
            if (parseInt(senderId) !== parseInt(config.ownerId)) {
                return reply("❌ Only the owner can toggle Self mode.");
            }

            // Path to store self mode status
            const fs = require("fs");
            const path = require("path");
            const selfFile = path.resolve(__dirname, "../temp/selfMode.json");

            let selfDB = { enabled: false };
            if (fs.existsSync(selfFile)) {
                selfDB = JSON.parse(fs.readFileSync(selfFile, "utf8"));
            }

            // Toggle self mode
            selfDB.enabled = !selfDB.enabled;
            fs.writeFileSync(selfFile, JSON.stringify(selfDB, null, 2), "utf8");

            reply(`✅ Self mode is now ${selfDB.enabled ? "ENABLED" : "DISABLED"}. Only you (owner) can use commands now.`);

        } catch (error) {
            console.error("Error in self.js:", error);
            reply("❌ Failed to toggle Self mode.");
        }
    },
};