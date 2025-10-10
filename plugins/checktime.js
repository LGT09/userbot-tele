const moment = require("moment-timezone");

module.exports = {
  command: ["time", "checktime", "clock"],
  run: async ({ client, message, text, reply }) => {
    try {
      // ─── If no city provided ──────────────────────────────
      if (!text) {
        return reply("🕒 Please provide a city name.\nExample: `.time Tokyo` or `.time New_York`");
      }

      const city = text.trim().replace(/\s+/g, "_"); // e.g. New York -> New_York
      const allZones = moment.tz.names();

      // ─── Try to find a timezone matching the input ─────────
      const match = allZones.find(zone => zone.toLowerCase().includes(city.toLowerCase()));

      if (!match) {
        return reply(`❌ City not found.\nTry again using underscores or correct spelling (e.g. \`.time New_York\`).`);
      }

      // ─── Get time info for the matched timezone ───────────
      const now = moment().tz(match);
      const utc = moment.utc();
      const hour = now.hour();

      // ─── Determine time of day ─────────────────────────────
      let period;
      if (hour >= 5 && hour < 12) period = "🌅 Morning";
      else if (hour >= 12 && hour < 17) period = "🌞 Afternoon";
      else if (hour >= 17 && hour < 20) period = "🌇 Evening";
      else period = "🌙 Night";

      const timeLocal = now.format("dddd, MMMM Do YYYY • HH:mm:ss");
      const timeUTC = utc.format("dddd, MMMM Do YYYY • HH:mm:ss");

      // ─── Build reply ──────────────────────────────────────
      const textMsg = `
🕒 *Current Time in ${match}*

🕰️ Local Time: *${timeLocal}*
🌐 UTC Time: *${timeUTC}*
📅 Date: *${now.format("YYYY-MM-DD")}*
🧭 Period: *${period}*

${period === "🌅 Morning"
  ? "Good morning! ☀️ Have a great start to your day!"
  : period === "🌞 Afternoon"
  ? "Good afternoon! Keep up the energy 💪"
  : period === "🌇 Evening"
  ? "Good evening! Time to relax 🌆"
  : "Good night! 🌙 Don’t forget to rest 😴"}
      `;

      await client.sendMessage(message.chat?.id || message.peerId, {
        message: textMsg.trim(),
        parseMode: "markdown",
        replyTo: message.id,
      });
    } catch (err) {
      console.error("❌ Error in checktime.js:", err);
      reply("❌ Failed to get current time for that city.");
    }
  },
};