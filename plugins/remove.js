const config = require("../config");

module.exports = {
    command: ["remove", "kick"],
    owner: true, // Only owner can use
    run: async ({ client, message, reply, text }) => {
        if (!text) return reply("❌ Please provide a user ID or username to remove.\n\nExample: .remove @username");

        try {
            // Attempt to remove user
            await client.kickParticipant(message.peerId, text);
            reply(`✅ Successfully removed ${text} from the group.`);
        } catch (error) {
            console.error("Error in remove.js:", error);
            reply("❌ Failed to remove user. Make sure the user ID/username is correct and the bot has permission.");
        }
    },
};