const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["tiktoksearch", "tts"],
    run: async ({ client, text, reply, message }) => {
        if (!text) {
            return reply("❌ Please provide a search query.\n\nExample: .tiktoksearch preset mlbb");
        }
        const searchingMessage = await reply("🔍 Searching for videos...");

        try {
            const apiUrl = `https://api.platform.web.id/tiktok-search?query=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data || data.status !== 200 || !data.video_url) {
                await client.deleteMessages(message.peerId, [searchingMessage.id]);
                return reply("❌ No video found for this query. Try a different keyword.");
            }
            
            const videoTitle = data.title;
            const videoUrl = data.video_url;

            const safeTitle = videoTitle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
            const tempDir = path.resolve(__dirname, "../temp");
            const videoPath = path.join(tempDir, `${safeTitle}_${Date.now()}.mp4`);

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const videoResponse = await axios.get(videoUrl, {
                responseType: "arraybuffer",
                timeout: 30000
            });

            fs.writeFileSync(videoPath, videoResponse.data);

            await client.sendMessage(message.peerId, {
                file: videoPath, // Path to the video file
                caption: `🎬 *TikTok Search*\n\n📌 *Title:* ${videoTitle}`,
            });

            fs.unlinkSync(videoPath);

        } catch (error) {
            console.error("Error in tiktoksearch command:", error);
            
            await client.deleteMessages(message.peerId, [searchingMessage.id]).catch(() => {});

            let errorMessage = "❌ An error occurred while processing your request.";
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errorMessage = "❌ Failed to connect to the server. Check your internet connection.";
            } else if (error.code === 'ETIMEDOUT') {
                errorMessage = "❌ Timeout: The video took too long to download.";
            }
            
            reply(errorMessage);
        }
    },
};