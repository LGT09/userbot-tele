const fs = require("fs");
const path = require("path");

const dbFile = path.resolve(__dirname, "../temp/activeDB.json");

// Load or initialize the database
let db = {};
if (fs.existsSync(dbFile)) {
    db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
} else {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf8");
}

// Helper: save DB
function saveDB() {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf8");
}

// Reset activity weekly (every 7 days)
const resetInterval = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
let lastReset = Date.now();
setInterval(() => {
    db = {};
    saveDB();
    console.log("[LISTACTIVE] Weekly reset completed.");
    lastReset = Date.now();
}, resetInterval);

module.exports = {
    command: ["listactive", "active"],
    run: async ({ client, message, reply }) => {
        try {
            const chatId = message.peerId;

            // Initialize group in DB if not exists
            if (!db[chatId]) db[chatId] = {};

            // Count the current message
            const senderId = message.senderId;
            if (!db[chatId][senderId]) db[chatId][senderId] = 0;
            db[chatId][senderId] += 1;
            saveDB();

            // Show leaderboard if command is used
            if (message.message.startsWith(".listactive") || message.message.startsWith(".active")) {
                const groupStats = db[chatId];

                // Convert to array and sort by message count
                const sortedUsers = Object.entries(groupStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10); // Top 10

                if (sortedUsers.length === 0) {
                    return reply("❌ No activity recorded yet in this group.");
                }

                let text = "📊 *Top Active Members*:\n\n";
                let mentions = [];

                let rank = 1;
                for (let [userId, count] of sortedUsers) {
                    let user;
                    try {
                        user = await client.getEntity(userId);
                    } catch {
                        user = { firstName: "Unknown" };
                    }

                    const name = user.username ? `@${user.username}` : user.firstName;
                    text += `${rank}. ${name} — ${count} messages\n`;

                    // Prepare mentions for tagging
                    mentions.push({ id: userId, firstName: name });

                    rank++;
                }

                await client.sendMessage(chatId, {
                    message: text,
                    entities: mentions.map(u => ({
                        type: "mention",
                        offset: text.indexOf(u.firstName),
                        length: u.firstName.length,
                        userId: u.id
                    })),
                    replyTo: message.id
                });
            }

        } catch (error) {
            console.error("Error in listactive.js:", error);
            reply("❌ Failed to fetch active members.");
        }
    },
};