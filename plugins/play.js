const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yts = require("yt-search");

module.exports = {
    command: ["play"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("📘 Usage: play <song name>");

        reply("🔍 Searching for the song...");

        try {
            // Step 1: Search YouTube for the song
            const search = await yts(text);
            if (!search || !search.videos.length) {
                return reply("🚫 No song found.");
            }

            const video = search.videos[0];
            const videoUrl = video.url;

            reply(`🎧 Found: *${video.title}*\n⏱ Duration: ${video.timestamp}`);

            // Step 2: Use Izumi API to get download link
            const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3`;

            const res = await axios.get(apiUrl, {
                timeout: 30000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            });

            if (!res.data || !res.data.result || !res.data.result.download) {
                return reply("🚫 Failed to fetch download link from Izumi API.");
            }

            const { download, title } = res.data.result;
            const safeTitle = title.replace(/[<>:"/\\|?*]+/g, "_"); // sanitize filename
            const audioPath = path.resolve(__dirname, `../temp/${safeTitle}.mp3`);

            reply(`📥 Downloading audio: *${title}*`);

            // Step 3: Download the MP3 file
            const file = await axios.get(download, { responseType: "arraybuffer" });
            fs.writeFileSync(audioPath, file.data);

            // Step 4: Send the audio file as a document
            await client.sendMessage(message.peerId, {
                message: `🎶 *${title}*`,
                file: audioPath,
                caption: `🎵 Title: *${title}*\n📺 Source: ${videoUrl}`,
                replyTo: message.id,
            });

            // Step 5: Clean up
            fs.unlinkSync(audioPath);
        } catch (error) {
            console.error("❌ Error in play command:", error.message);
            reply("🚫 An error occurred while processing your request.");
        }
    },
};