const fs = require("fs");
const path = require("path");
const PLUGIN_FOLDER = path.join(__dirname, "../plugins");

module.exports = {
  command: ["listplugin"],
  owner: true,
  run: async ({ reply }) => {
    try {
      if (!fs.existsSync(PLUGIN_FOLDER)) return reply("❌ Plugins folder not found.");
      const plugins = fs.readdirSync(PLUGIN_FOLDER).filter(f => f.endsWith(".js"));
      if (!plugins.length) return reply("ℹ️ No plugins found.");

      reply("📦 Loaded Plugins:\n" + plugins.map(p => `• ${p}`).join("\n"));
    } catch (err) {
      console.error(err);
      reply("❌ Failed to list plugins.");
    }
  },
};