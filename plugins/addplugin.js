const fs = require("fs");
const path = require("path");
const PLUGIN_FOLDER = path.join(__dirname, "../plugins");

module.exports = {
  command: ["addplugin"],
  owner: true,
  run: async ({ client, message, text, reply }) => {
    try {
      const parts = text.split(/\s+/);
      let pluginName = parts[0];
      const pluginCode = parts.slice(1).join(" ");

      if (!pluginName || !pluginCode)
        return reply("❌ Usage: `.addplugin <plugin_name.js> <code>`");

      if (!pluginName.endsWith(".js")) pluginName += ".js";
      if (!fs.existsSync(PLUGIN_FOLDER)) fs.mkdirSync(PLUGIN_FOLDER);

      fs.writeFileSync(path.join(PLUGIN_FOLDER, pluginName), pluginCode, "utf8");
      reply(`✅ Plugin \`${pluginName}\` added! Restart the bot to load it.`);
    } catch (err) {
      console.error(err);
      reply("❌ Failed to add plugin.");
    }
  },
};