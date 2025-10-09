const fs = require("fs");
const path = require("path");

const dbFile = path.resolve(__dirname, "../temp/antilink.json");

// Load or initialize database
let db = {};
if (fs.existsSync(dbFile)) {
    db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
} else {
    fs.writeFileSync(dbFile, JSON.stringify(db), "utf8");
}

module.exports = {
    command: ["antilink", "antilinktoggle"],
    run: async ({ client, message, reply, isAdmins, senderId, text }) => {
        try {
            const chatId = message.peerId;

            // Admin-only toggle
            if (message.message.startsWith(".antilinktoggle")) {
                if (!isAdmins) return reply("❌ Only admins can toggle AntiLink.");

                // Toggle the current status
                db[chatId] = !db[chatId];
                fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf8");

                return reply(`✅ AntiLink is now ${db[chatId] ? "ENABLED" : "DISABLED"} in this group.`);
            }

            // Check if antilink is enabled for this group
            if (!db[chatId]) return;

            if (!message.message) return;

            // Ignore admins
            if (isAdmins) return;

            // Detect links
            const linkRegex = /(https?:\/\/[^\s]+)|(t\.me\/[^\s]+)|(discord\.gg\/[^\s]+)|(instagram\.com\/[^\s]+)|(youtube\.com\/[^\s]+)/gi;

            if (linkRegex.test(message.message)) {
                // Delete the message
                await client.deleteMessages(chatId, [message.id]);

                // Warn the user
                await client.sendMessage(chatId, {
                    message: `❌ Links are not allowed in this group!`,
                    replyTo: message.id
                });

                console.log(`[ANTI-LINK] Deleted link from user ${senderId} in chat ${chatId}`);
            }

        } catch (error) {
            console.error("Error in antilink.js:", error);
        }
    },
};