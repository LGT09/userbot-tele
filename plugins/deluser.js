/*
 * 🗑️ Trashcore User Deleter
 * ─────────────────────────────
 * Usage:
 *   .deluser <number>
 *
 * Example:
 *   .deluser 254712345678
 *
 * It finds and deletes the user (and optionally their servers)
 * created using that number in username/email.
 */

const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
    command: ["deluser"],
    owner: true,
    run: async ({ client, text, reply, message }) => {
        try {
            if (!text) return reply("❌ Please provide a Username.\nExample: `.deluser Trashcx`");

            const number = text.replace(/[^0-9]/g, "");
            reply(`🔍 Searching for user linked to number *${number}*...`);

            // 🧩 Step 1: Fetch all users from panel
            const userRes = await fetch(`${config.domain}/api/application/users?per_page=10000`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apikey}`,
                },
            });

            const userData = await userRes.json();
            if (userData.errors) {
                return reply(`🚫 Failed to fetch users:\n${JSON.stringify(userData.errors[0], null, 2)}`);
            }

            const found = userData.data.find(u => {
                const attr = u.attributes;
                return attr.email.includes(number) || attr.username.includes(number);
            });

            if (!found) return reply(`❌ No user found linked to number *${number}*`);

            const userId = found.attributes.id;
            const userEmail = found.attributes.email;
            const userName = found.attributes.username;

            reply(`🧾 Found user:\n👤 ${userName}\n📧 ${userEmail}\n🆔 ${userId}\n\n🗑️ Deleting user...`);

            // 🧩 Step 2: Delete the user
            const delUserRes = await fetch(`${config.domain}/api/application/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apikey}`,
                },
            });

            if (delUserRes.status === 204) {
                return reply(`✅ Successfully deleted user *${userName}* (${userEmail})`);
            }

            const delData = await delUserRes.json();
            if (delData.errors) {
                return reply(`🚫 Failed to delete user:\n${JSON.stringify(delData.errors[0], null, 2)}`);
            }

            reply("⚠️ User deletion failed. Please check logs or verify ID.");

        } catch (err) {
            console.error("❌ Error in deluser.js:", err);
            reply("🚫 Something went wrong while deleting the user.");
        }
    }
};