const config = require("../config");

module.exports = {
    command: ["tagall"],
    owner: true, // Optional: set to true if only owner can use
    run: async ({ client, message, reply }) => {
        try {
            // Get participants in the chat
            const participants = await client.getParticipants(message.peerId);
            if (!participants || participants.length === 0) {
                return reply("❌ No participants found in this group.");
            }

            // Prepare mentions
            let mentionsText = "";
            for (let user of participants) {
                if (user.id === message.senderId) continue; // Skip the sender
                let username = user.username ? `@${user.username}` : `${user.firstName || "User"}`;
                mentionsText += `${username} `;
            }

            if (!mentionsText) {
                return reply("❌ No other users to tag.");
            }

            // Send message with all mentions
            await client.sendMessage(message.peerId, {
                message: mentionsText.trim(),
                replyTo: message.id
            });

        } catch (error) {
            console.error("Error in tagall.js:", error);
            reply("❌ Failed to tag all users.");
        }
    },
};