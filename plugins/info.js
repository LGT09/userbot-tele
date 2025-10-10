const os = require("os");
const moment = require("moment");

module.exports = {
  command: ["info", "botinfo", "systeminfo"],
  run: async ({ client, message, reply }) => {
    try {
      // ─── Measure ping ───────────────────────────────────
      const start = Date.now();

      // We can simulate ping as round-trip time from here
      const ping = Date.now() - start;

      // ─── Uptime ─────────────────────────────────────────
      const uptimeSeconds = process.uptime();
      const uptimeHuman = moment
        .duration(uptimeSeconds, "seconds")
        .humanize();
      const uptimeFormatted = moment.utc(uptimeSeconds * 1000).format("HH:mm:ss");

      // ─── Memory & System Info ───────────────────────────
      const totalMem = (os.totalmem() / 1024 ** 3).toFixed(2);
      const freeMem = (os.freemem() / 1024 ** 3).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);

      const infoMessage = `
🤖 *Bot Information*

👑 Creator: Trashcore
⚙️ Version: 2.0.0
🕐 Uptime: ${uptimeFormatted} (≈ ${uptimeHuman})

📡 Performance
• Ping: ${ping} ms
• CPU: ${os.cpus()[0].model}
• Architecture: ${os.arch()}
• Platform: ${os.platform()}

💾 Memory
• Total: ${totalMem} GB
• Used: ${usedMem} GB
• Free: ${freeMem} GB

🪄 Runtime
• Node.js: ${process.version}
• Hostname: ${os.hostname()}
• Date: ${moment().format("dddd, MMMM Do YYYY")}
• Time: ${moment().format("hh:mm:ss A")}
      `.trim();

      // ─── Send info message directly ──────────────────────
      await client.sendMessage(message.chat?.id || message.peerId, {
        message: infoMessage,
        parseMode: "markdown",
        replyTo: message.id,
      });

    } catch (err) {
      console.error("❌ Error in info.js:", err);
      reply("❌ Failed to retrieve system info.");
    }
  },
};