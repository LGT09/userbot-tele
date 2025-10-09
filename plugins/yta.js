const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["yta"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Example: yta https://youtube.com/watch?v=Mx92lTYxrJQ");

        reply("🎵 Searching for audio...");

        try {
            // Step 1: Fetch data from Savetube API
            const apiUrl = `https://api.platform.web.id/savetube?url=${encodeURIComponent(text)}&format=mp3`;
            const { data } = await axios.get(apiUrl);

            // Step 2: Validate API response
            if (!data.status || !data.result) {
                return reply("🚫 Failed to fetch audio data. Make sure the URL is correct or try again later.");
            }

            const audioUrl = data.result.download_url;
            const audioTitle = data.result.title;
            const duration = data.result.duration;

            // Step 3: Prepare path and download audio file
            const safeTitle = audioTitle.replace(/[^a-zA-Z0-9]/g, "_");
            const tempDir = path.resolve(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const audioPath = path.join(tempDir, `${safeTitle}_${Date.now()}.mp3`);
            
            const audioFile = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(audioPath, audioFile.data);

            // Step 4: Send audio to user
            await client.sendMessage(message.peerId, {
                file: audioPath,
                caption: `🎵 YouTube Audio\n\n📌 *Title:* ${audioTitle}\n⏱️ *Duration:* ${duration} seconds`,
                replyTo: message.id
            });

            // Step 5: Delete file after sending
            fs.unlinkSync(audioPath);
        } catch (error) {
            console.error("Error in yta.js:", error);
            reply("🚫 An error occurred, the URL may be invalid or the server might be down.");
        }
    },
};