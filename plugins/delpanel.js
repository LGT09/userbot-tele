/*
 * 🗑️ Trashcore Panel Deleter (Final Version)
 * ─────────────────────────────────────────────
 * ✅ Deletes a Pterodactyl/CPanel server by its ID or URL.
 * 🔹 Usage:
 *     .delpanel <server_id>
 *     .delpanel <panel_url>
 *
 * Example:
 *     .delpanel 72
 *     .delpanel https://panel.trashcore.site/server/72
 *
 * Author: Trashcore 
 */

const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
    command: ["delpanel"],
    owner: true,
    run: async ({ client, text, reply }) => {
        try {
            if (!text) {
                return reply("❌ Please provide a valid Server ID or Panel URL.\n\nExample:\n.delpanel 72\n.delpanel https://panel.domain.com/server/72");
            }

            // 🔹 Extract numeric ID from either plain ID or URL
            const serverIdMatch = text.match(/(\d+)/);
            if (!serverIdMatch) {
                return reply("⚠️ Invalid input. Please provide a valid server ID or link containing one.");
            }

            const serverId = serverIdMatch[1];
            reply(`🗑️ Deleting panel/server with ID *${serverId}*...`);

            // 🔹 Send DELETE request to API
            const delRes = await fetch(`${config.domain}/api/application/servers/${serverId}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apikey}`,
                },
            });

            // 🔹 Success: Pterodactyl returns status 204 (No Content)
            if (delRes.status === 204) {
                return reply(`✅ Successfully deleted panel/server with ID *${serverId}*.`);
            }

            // 🔹 If not 204, try reading error details
            let errorData;
            try {
                errorData = await delRes.json();
            } catch {
                errorData = null;
            }

            if (errorData?.errors?.length) {
                return reply(`🚫 Failed to delete server:\n${JSON.stringify(errorData.errors[0], null, 2)}`);
            }

            reply(`⚠️ Unable to delete server ID ${serverId}. Please ensure it exists or check API permissions.`);

        } catch (err) {
            console.error("❌ Error in delpanel.js:", err);
            reply("🚫 Something went wrong while deleting the panel. Please try again later.");
        }
    },
};