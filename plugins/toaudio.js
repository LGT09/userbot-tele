const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
    command: ["toaudio", "extractaudio"],
    run: async ({ client, message, reply }) => {
        try {
            // Check if the message is a reply with a media file
            if (!message.replyTo || !message.replyTo.file) {
                return reply("❌ Please reply to a video file to convert it to audio.");
            }

            const media = message.replyTo.file;
            const tempDir = path.resolve(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const videoPath = path.join(tempDir, `video_${Date.now()}.mp4`);
            const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);

            reply("⏳ Downloading video...");

            // Download the video first
            const videoData = await client.downloadMedia(media);
            fs.writeFileSync(videoPath, videoData);

            reply("🎵 Converting video to audio...");

            // Convert video to audio using ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .toFormat("mp3")
                    .on("error", reject)
                    .on("end", resolve)
                    .save(audioPath);
            });

            // Send audio file back to user
            await client.sendMessage(message.peerId, {
                file: audioPath,
                caption: "🎶 Here’s your extracted audio!",
                replyTo: message.id
            });

            // Clean up temporary files
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);

        } catch (error) {
            console.error("Error in toaudio.js:", error);
            reply("❌ Failed to convert video to audio.");
        }
    },
};