const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

module.exports = {
  command: ["tts", "say"],
  run: async ({ client, message, text, reply }) => {
    try {
      // ─── Check if user entered text ─────────────────────────────
      if (!text) {
        return reply("🗣️ Please provide text to convert to speech.\nExample: `.tts Hello everyone!`");
      }

      // ─── Safe ID handling (prevents undefined errors) ──────────
      const chatId =
        message.chat?.id ||
        message.peerId?.chatId ||
        message.peerId ||
        message.chatId;

      const senderId =
        message.sender?.id ||
        message.senderId ||
        message.fromId?.userId;

      if (!chatId) return reply("⚠️ Could not identify the chat ID.");
      if (!senderId) return reply("⚠️ Could not identify the sender.");

      // ─── Generate TTS from Google Translate ────────────────────
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        text
      )}&tl=en&client=tw-ob`;

      const filePath = path.join(__dirname, "../temp", `tts_${Date.now()}.mp3`);
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to generate speech audio.");

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // ─── Send audio as voice note ───────────────────────────────
      await client.sendFile(chatId, {
        file: filePath,
        caption: "🎙️ *Generated Speech*",
        replyTo: message.id,
        voiceNote: true, // sends as a Telegram voice message
      });

      // ─── Cleanup ────────────────────────────────────────────────
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("❌ Error in TTS command:", error);
      reply("❌ Failed to generate TTS audio.");
    }
  },
};