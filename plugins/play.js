/*  
 * this code was created with assistance from chatgpt  
 * feature logic developed by kyuurzy
 */
 
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["play"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Example: play runtuh");

        reply("🔍 Searching for the song...");

        try {
            // Step 1: Search video
            const searchRes = await axios.get(`https://apidl.vercel.app/api/ytsearch?q=${encodeURIComponent(text)}`);
            const searchData = searchRes.data;

            if (!searchData.status || searchData.result.length === 0) {
                return reply("🚫 Song not found.");
            }

            const firstResult = searchData.result[0];
            const videoUrl = firstResult.url;

            // Step 2: Download audio
            reply(`🎧 Downloading audio from: ${firstResult.title}`);
            const downloadRes = await axios.get(`https://api.platform.web.id/savetube?url=${encodeURIComponent(videoUrl)}&format=mp3`);
            const downloadData = downloadRes.data;

            if (!downloadData.status) {
                return reply("🚫 Failed to download audio.");
            }

            const audioUrl = downloadData.result.download_url;
            const audioTitle = downloadData.result.title;

            // Step 3: Download the audio file
            const audioPath = path.resolve(__dirname, `../temp/${audioTitle}.mp3`);
            const audioFile = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(audioPath, audioFile.data);

            // Step 4: Send audio to user
            await client.sendMessage(message.peerId, {
                message: `🎶 Playing: *${audioTitle}*`,
                file: audioPath,
                caption: `🎵 Song: *${audioTitle}*`,
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