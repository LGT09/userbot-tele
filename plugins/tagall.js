module.exports = {
    command: ["tagall"],
    help: ["tagall <optional message>"],
    tags: ["group"],

    run: async ({ client, text, reply, message, senderId }) => {
        try {
            if (!message.isGroup) return reply("❌ This command works only in groups!");

            // Fetch participants
            const participants = await client.getParticipants(message.peerId);
            
            // Check admin privilege
            const admins = participants.filter(p => p.isAdmin || p.isCreator).map(p => p.id);
            if (senderId !== parseInt(process.env.OWNER_ID) && !admins.includes(senderId)) {
                return reply("❌ Only admins can use this command!");
            }

            // Optional message
            const msgText = text || "⚡ Tagging members...";
            
            // Limit to 400 participants max
            const membersToTag = participants.slice(0, 400).filter(u => !u.isBot);

            // Prepare mentions
            const mentionChunks = [];
            const batchSize = 30; // mentions per message
            for (let i = 0; i < membersToTag.length; i += batchSize) {
                const batch = membersToTag.slice(i, i + batchSize);
                const mentions = batch.map(u => `[${u.firstName}](tg://user?id=${u.id})`).join(" ");
                mentionChunks.push(mentions);
            }

            // Send messages
            for (const chunk of mentionChunks) {
                await client.sendMessage(message.peerId, {
                    message: `👥 **Tag All by Admin**\n\n💬 Message: ${msgText}\n\n${chunk}`,
                    parseMode: "Markdown",
                    replyTo: message.id,
                    linkPreview: false
                });
            }

        } catch (err) {
            console.error("TagAll command error:", err);
            reply("❌ Something went wrong while tagging members.");
        }
    }
};