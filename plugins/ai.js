const axios = require("axios");

module.exports = {
    command: ["ai"],
    help: ["copilot"],
    tags: ["ai"],

    run: async ({ client, text, reply, message }) => {
        try {
            if (!text) return reply("⚠️ Please provide a query, e.g., `ai explain quantum computing`");

            reply("🤖 Thinking...");

            const res = await axios.get(
                `https://api.nekolabs.my.id/ai/copilot?text=${encodeURIComponent(text)}`
            );

            if (!res.data || !res.data.result || !res.data.result.text)
                return reply("❌ No response from Copilot API.");

            await client.sendMessage(message.peerId, {
                message: res.data.result.text,
                replyTo: message.id,
            });
        } catch (err) {
            console.error(err);
            reply("🚫 Error: " + err.message);
        }
    },
};