const fs = require("fs");
const path = require("path");
const PLUGIN_FOLDER = path.join(__dirname, "../plugins");

module.exports = {
  command: ["getplugin"],
  owner: true,
  run: async ({ client, message, reply, text }) => {
    try {
      if (!text) return reply("❌ Usage: `.getplugin <plugin_name.js>`");

      const filePath = path.join(PLUGIN_FOLDER, text);
      if (!fs.existsSync(filePath)) return reply("❌ Plugin not found.");

      await client.sendMessage(message.chat?.id || message.peerId, {
        message: `📂 ${text}`,
        file: filePath,
      });
    } catch (err) {
      console.error(err);
      reply("❌ Failed to send plugin.");
    }
  },
};