const os = require("os");
const { performance } = require("perf_hooks");

const botStartTime = performance.now();

function formatRuntime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
    command: ["menu"],
    run: async ({ client, message, reply }) => {
        try {
            const user = await client.getEntity(message.senderId);
            const username = user.username ? `@${user.username}` : "";
            const fullName = user.firstName + (user.lastName ? ` ${user.lastName}` : "");
            const mention = username || fullName;
            const userId = user.id;
            const runtime = formatRuntime(performance.now() - botStartTime);

            const caption = `👋 Hi ${mention}, I am an automated Telegram bot (Userbot) created by @trashcoredev.

📌 Information:
 ▢ Creator: Trashcore
 ▢ Runtime: ${runtime}
 ▢ Telegram ID: ${userId}
 ▢ Version: 1.1.0
 ▢ Type: Userbot
 ▢ Language: JavaScript

⚡ General Commands:
 ▢ play
 ▢ spotify
 ▢ broadcast
 ▢ tiktoksearch
 ▢ spotifydl
 ▢ tiktok
 ▢ Instagram
 ▢ yta
 ▢ ytv
 ▢ tagall
 ▢ add
 ▢ remove
 ▢ getdp
 ▢ antilink
 ▢ listactive
 ▢ listinactive
 ▢ self
 ▢ public
 ▢ ping
 ▢ uptime
 ▢ fancy
 ▢ tts
 ▢ time
 ▢ info

🖥️ Admin / Group Commands:
 ▢ promote
 ▢ demote
 ▢ admin
 ▢ delowner
 ▢ addowner
 ▢ listplugin 
 ▢ getplugin
 ▢ addplugin
 ▢ removeplugin

💻 Panel / CPanel Commands:
 ▢ 1gb-unli
 ▢ listpanel
 ▢ delpanel 
 ▢ deluser 
 ▢ gethtml 
 ▢ gitclone 
 ▢ toaudio 
 ▢ tovideo `;

            await client.sendFile(message.chatId, {
                file: "https://files.catbox.moe/cpzd4i.jpg",
                caption: caption,
                replyTo: message.id,
            });
        } catch (error) {
            console.error("Error in menu.js:", error);
            reply("❌ Failed to display menu.");
        }
    },
};