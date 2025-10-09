module.exports = {
    command: ["ping"],
    run: async ({ client, message, reply }) => {
        const start = Date.now();
        const msg = await reply("🏓 Pinging...");
        const latency = Date.now() - start;
        await client.sendMessage(message.peerId, {
            message: `🏓 Pong!\nLatency: ${latency}ms`,
            replyTo: message.id
        });
        // Delete the initial "Pinging..." message
        try {
            await client.deleteMessages(message.peerId, [msg.id]);
        } catch {}
    }
};