const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["spotifydl"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Example: spotifydl https://open.spotify.com/track/6Hii26x3qDErVitnGW8QtO");

        reply("🎧 Downloading song from Spotify...");

        try {
            // Step 1: Download song from Spotify
            const downloadRes = await axios.get(`https://apidl.vercel.app/api/spotifydl?url=${encodeURIComponent(text)}`);
            const downloadData = downloadRes.data;

            if (!downloadData.status) {
                return reply("🚫 Failed to download audio from Spotify.");
            }

            const audioUrl = downloadData.result.download;
            const audioTitle = downloadData.result.title;
            const artists = downloadData.result.artist;

            // Step 2: Download the audio file
            const safeTitle = audioTitle.replace(/[^a-zA-Z0-9]/g, "_");
            const audioPath = path.resolve(__dirname, `../temp/${safeTitle}.mp3`);
            const audioFile = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(audioPath, audioFile.data);

            // Step 3: Send audio to user
            await client.sendMessage(message.peerId, {
                message: `🎶 Playing: *${audioTitle}*`,
                file: audioPath,
                caption: `🎵 Song: *${audioTitle}*\n👤 Artist: *${artists}*`,
                replyTo: message.id
            });

            // Clean up
            fs.unlinkSync(audioPath);
        } catch (error) {
            console.error(error);
            reply("🚫 An error occurred while processing your request.");
        }
    },
};