const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["spotify"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Example: spotify runtuh");

        reply("🔍 Searching for the song on Spotify...");

        try {
            // Step 1: Search song on Spotify
            const searchRes = await axios.get(`https://apidl.vercel.app/api/spotifysearch?q=${encodeURIComponent(text)}`);
            const searchData = searchRes.data;

            if (!searchData.status || searchData.result.length === 0) {
                return reply("🚫 Song not found on Spotify.");
            }

            const firstResult = searchData.result[0];
            const songLink = firstResult.link;

            // Step 2: Download song from Spotify
            reply(`🎧 Downloading audio from: ${firstResult.title} (${firstResult.artists})`);
            const downloadRes = await axios.get(`https://apidl.vercel.app/api/spotifydl?url=${encodeURIComponent(songLink)}`);
            const downloadData = downloadRes.data;

            if (!downloadData.status) {
                return reply("🚫 Failed to download audio from Spotify.");
            }

            const audioUrl = downloadData.result.download;
            const audioTitle = downloadData.result.title;
            const artists = downloadData.result.artist;

            // Step 3: Download the audio file
            const audioPath = path.resolve(__dirname, `../temp/${audioTitle.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`);
            const audioFile = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(audioPath, audioFile.data);

            // Step 4: Send audio to user
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