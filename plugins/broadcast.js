

const config = require("../config");

module.exports = {
    command: ["broadcast"],
    owner: true,
    run: async ({ client, message, reply }) => {
        let text = message.message.split(" ").slice(1).join(" ").trim();
        if (!text) return reply("Example: broadcast hello world!");

        let dialogs = await client.getDialogs();
        let groups = dialogs.filter(d => d.isGroup);
        let channels = dialogs.filter(d => d.isChannel);

        let success = 0;
        let failed = 0;
        let sentChats = new Set();

        for (let chat of [...groups, ...channels]) {
            if (!sentChats.has(chat.id)) {
                try {
                    await client.sendMessage(chat.id, { message: text });
                    success++;
                    sentChats.add(chat.id);
                } catch {
                    failed++;
                }
            }
        }

        let userId = message.senderId;
        await client.sendMessage(userId, {
            message: `✅ Broadcast completed!\n\n` +
                     `📢 Groups: ${groups.length} | Successful: ${success}\n` +
                     `📡 Channels: ${channels.length} | Failed: ${failed}`
        });
        reply("✅ Broadcast is being sent, results will be delivered to your private chat.");
    }
};