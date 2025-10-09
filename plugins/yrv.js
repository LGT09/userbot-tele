const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["ytv"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Example: ytv https://youtube.com/watch?v=Mx92lTYxrJQ");

        reply("🎬 Searching for the video...");

        try {
            // Step 1: Fetch data from Notube API
            const apiUrl = `https://api.platform.web.id/notube/download?url=${encodeURIComponent(text)}&format=mp4`;
            const { data } = await axios.get(apiUrl);

            // Step 2: Validate API response
            if (!data.title || !data.download_url) {
                return reply("🚫 Failed to fetch video data. Make sure the URL is correct or try again later.");
            }

            const videoUrl = data.download_url;
            const videoTitle = data.title;

            // Step 3: Prepare path and download video file
            const safeTitle = videoTitle.replace(/[^a-zA-Z0-9]/g, "_");
            const tempDir = path.resolve(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const videoPath = path.join(tempDir, `${safeTitle}_${Date.now()}.mp4`);

            const videoFile = await axios.get(videoUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(videoPath, videoFile.data);

            // Step 4: Send video to user
            await client.sendMessage(message.peerId, {
                file: videoPath,
                caption: `🎬 YouTube Video\n\n📌 *Title:* ${videoTitle}`,
                replyTo: message.id
            });

            // Step 5: Delete file after sending
            fs.unlinkSync(videoPath);
        } catch (error) {
            console.error("Error in ytv.js:", error);
            reply("🚫 An error occurred, the URL may be invalid or the server might be down.");
        }
    },
};