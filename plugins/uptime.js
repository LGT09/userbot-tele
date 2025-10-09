const { performance } = require("perf_hooks");

let botStartTime = performance.now();

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
    command: ["uptime"],
    run: async ({ client, message, reply }) => {
        try {
            const uptime = formatUptime(performance.now() - botStartTime);
            reply(`⏱ Bot Uptime: ${uptime}`);
        } catch (error) {
            console.error("Error in uptime.js:", error);
            reply("❌ Failed to get uptime.");
        }
    },
};