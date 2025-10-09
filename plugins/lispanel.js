/*
 * 🧾 List Panel Plugin
 * Lists all servers from your Pterodactyl panel
 * Author: Trashcore | Assistant: ChatGPT (GPT-5)
 */

const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
    command: ["listpanel"],
    owner: true,
    run: async ({ client, reply, message }) => {
        try {
            reply("📦 Fetching panel servers, please wait...");

            const res = await fetch(`${config.domain}/api/application/servers`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.apikey}`,
                },
            });

            const data = await res.json();

            if (data.errors) {
                return reply(`❌ Error:\n${JSON.stringify(data.errors[0], null, 2)}`);
            }

            if (!data.data || data.data.length === 0) {
                return reply("📭 No servers found on your panel.");
            }

            let msg = `🧾 *Server List (${data.data.length})*\n\n`;
            for (let srv of data.data) {
                const s = srv.attributes;
                msg += `🔹 **${s.name}**
🆔 ID: ${s.id}
👤 User ID: ${s.user}
💾 Memory: ${s.limits.memory === 0 ? "Unlimited" : s.limits.memory + " MB"}
🖥️ CPU: ${s.limits.cpu === 0 ? "Unlimited" : s.limits.cpu + "%"}
📦 Disk: ${s.limits.disk === 0 ? "Unlimited" : s.limits.disk + " MB"}
🌍 Node: ${s.node}
─────────────────\n`;
            }

            await client.sendMessage(message.chatId, { message: msg, replyTo: message.id });
        } catch (err) {
            console.error("❌ Error in listpanel.js:", err);
            reply("🚫 Failed to fetch servers.");
        }
    },
};