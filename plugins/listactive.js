// In-memory message count storage: {(chatId:userId): count}
const messageCounts = {};

module.exports = {
    command: ["listactive"],
    help: ["listactive"],
    tags: ["group"],

    run: async ({ client, text, reply, message }) => {
        try {
            if (!message.isGroup) return reply("⚠️ This command works only in groups.");

            const chatId = message.peerId;

            // ─── TRACK MESSAGE COUNT ───
            if (message.senderId) {
                const key = `${chatId}:${message.senderId}`;
                messageCounts[key] = (messageCounts[key] || 0) + 1;
            }

            // ─── LIST ACTIVE MEMBERS ───
            const participants = await client.getParticipants(chatId);
            const users = participants
                .filter((p) => !p.isBot)
                .map((p) => ({ user: p, count: messageCounts[`${chatId}:${p.id}`] || 0 }));

            if (!users.length) return reply("No members found to track activity.");

            // sort descending by message count
            users.sort((a, b) => b.count - a.count);

            let textMsg = "🟢 *Most Active Members:*\n";
            users.slice(0, 20).forEach((u, i) => {
                textMsg += `${i + 1}. [${u.user.firstName}](${u.user.id}) — ${u.count} messages\n`;
            });

            await client.sendMessage(chatId, { message: textMsg, replyTo: message.id });

        } catch (err) {
            console.error("ListActive error:", err);
            reply("❌ Something went wrong while processing this command.");
        }
    },
};