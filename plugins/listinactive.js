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

module.exports = {
    command: ["listinactive", "inactive"],
    run: async ({ client, message, reply }) => {
        try {
            const chatId = message.peerId;

            if (!db[chatId]) return reply("❌ No activity recorded yet in this group.");

            const groupStats = db[chatId];

            // Convert to array and sort ascending (least active first)
            const sortedUsers = Object.entries(groupStats)
                .sort((a, b) => a[1] - b[1])
                .slice(0, 10); // Top 10 least active

            if (sortedUsers.length === 0) {
                return reply("❌ No activity recorded yet in this group.");
            }

            let text = "📉 *Top Inactive Members*:\n\n";
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

        } catch (error) {
            console.error("Error in listinactive.js:", error);
            reply("❌ Failed to fetch inactive members.");
        }
    },
};