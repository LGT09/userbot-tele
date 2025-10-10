const fs = require("fs");
const path = require("path");
const PLUGIN_FOLDER = path.join(__dirname, "../plugins");

module.exports = {
  command: ["removeplugin", "rmplugin"],
  owner: true,
  run: async ({ reply, text }) => {
    try {
      // Ensure text exists and is trimmed
      const pluginName = (text || "").trim();
      if (!pluginName) return await reply("❌ Usage: `.removeplugin <plugin_name.js>`");

      // Ensure it has .js extension
      const fileName = pluginName.endsWith(".js") ? pluginName : `${pluginName}.js`;

      const filePath = path.join(PLUGIN_FOLDER, fileName);

      if (!fs.existsSync(filePath)) return await reply("❌ Plugin not found.");

      fs.unlinkSync(filePath);
      await reply(`✅ Plugin \`${fileName}\` removed! Restart the bot to update.`);
    } catch (err) {
      console.error("❌ removeplugin.js error:", err);
      await reply("❌ Failed to remove plugin.");
    }
  },
};