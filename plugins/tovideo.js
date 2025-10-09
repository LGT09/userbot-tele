const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
    command: ["tovideo", "audiotovideo"],
    run: async ({ client, message, reply }) => {
        try {
            // Check if the message is a reply with an audio file
            if (!message.replyTo || !message.replyTo.file) {
                return reply("❌ Please reply to an audio file to convert it to video.");
            }

            const media = message.replyTo.file;
            const tempDir = path.resolve(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);
            const videoPath = path.join(tempDir, `video_${Date.now()}.mp4`);

            reply("⏳ Downloading audio...");

            // Download the audio first
            const audioData = await client.downloadMedia(media);
            fs.writeFileSync(audioPath, audioData);

            reply("🎬 Converting audio to video...");

            // Convert audio to video with blank screen
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(audioPath)
                    .inputOptions("-loop 1")
                    .outputOptions([
                        "-c:v libx264",
                        "-tune stillimage",
                        "-c:a aac",
                        "-b:a 192k",
                        "-pix_fmt yuv420p",
                        "-shortest"
                    ])
                    .input("color=c=blue:s=1280x720") // simple blue background
                    .on("error", reject)
                    .on("end", resolve)
                    .save(videoPath);
            });

            // Send video back to user
            await client.sendMessage(message.peerId, {
                file: videoPath,
                caption: "🎥 Audio converted to video!",
                replyTo: message.id
            });

            // Clean up temporary files
            fs.unlinkSync(audioPath);
            fs.unlinkSync(videoPath);

        } catch (error) {
            console.error("Error in tovideo.js:", error);
            reply("❌ Failed to convert audio to video.");
        }
    },
};