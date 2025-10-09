const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["tiktokdl", "tt", "tiktok"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Example: tiktokdl https://vt.tiktok.com/...");

        try {
            reply('⏳ Downloading data from TikTok...');

            // Step 1: Fetch data from API
            let res = await axios.get(`https://api.platform.web.id/tiktok?url=${encodeURIComponent(text)}`);
            let json = res.data;

            if (!json.status) throw 'Failed to fetch data from TikTok. Make sure the URL is valid.';

            let { title, taken_at, region, id, duration, cover, music_info, data, author } = json;

            // Step 2: Create informative caption
            let caption = `*TikTok Downloader*\n\n` +
                          `🎞 *Title:* ${title}\n` +
                          `👤 *Author:* ${author.nickname} (@${author.unique_id})\n` +
                          `📅 *Taken At:* ${taken_at}\n` +
                          `🌍 *Region:* ${region}\n` +
                          `🆔 *ID:* ${id}\n` +
                          `⏱ *Duration:* ${duration} seconds\n` +
                          `🎵 *Music:* ${music_info.title} - ${music_info.author}`;

            // Step 3: Prepare temp folder
            const tempDir = path.resolve(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Step 4: Detect content type (Video or Photo Slide)
            let hasVideo = data.find(v => v.type === 'nowatermark');
            let isPhoto = data.every(v => v.type === 'photo');

            if (isPhoto) {
                // If this is a photo slide
                reply(`📸 Found ${data.length} photos. Sending them one by one...`);
                for (let i = 0; i < data.length; i++) {
                    let p = data[i];
                    let photoUrl = p.url; // Assuming photo URL is in 'url'
                    let photoPath = path.join(tempDir, `tiktok_photo_${Date.now()}_${i + 1}.jpg`);
                    
                    // Download photo
                    let photoData = await axios.get(photoUrl, { responseType: 'arraybuffer' });
                    fs.writeFileSync(photoPath, photoData.data);

                    // Send photo
                    await client.sendMessage(message.peerId, {
                        file: photoPath,
                        caption: i === 0 ? caption : '', // Only send caption on the first photo
                        replyTo: message.id
                    });

                    // Delete file after sending
                    fs.unlinkSync(photoPath);

                    // Delay to avoid spamming
                    if (i < data.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } else if (hasVideo) {
                // If this is a video
                let videoUrl = hasVideo.url; // Assuming video URL is in 'url'
                let videoPath = path.join(tempDir, `tiktok_video_${Date.now()}.mp4`);
                
                // Download video
                let videoData = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                fs.writeFileSync(videoPath, videoData.data);

                // Send video
                await client.sendMessage(message.peerId, {
                    file: videoPath,
                    caption: caption,
                    replyTo: message.id
                });

                // Delete file after sending
                fs.unlinkSync(videoPath);
            } else {
                return reply('🚫 No supported media found (video/photo).');
            }

            // Step 5: Always send the audio/music
            if (music_info && music_info.play) { // Assuming audio URL is in music_info.play
                reply('🎵 Sending the audio/music...');
                let audioUrl = music_info.play;
                let audioPath = path.join(tempDir, `tiktok_audio_${Date.now()}.mp3`);
                
                // Download audio
                let audioData = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                fs.writeFileSync(audioPath, audioData.data);

                // Send audio
                await client.sendMessage(message.peerId, {
                    file: audioPath,
                    caption: `🎵 *TikTok Music*\n\n🎶 *Title:* ${music_info.title}\n👤 *Artist:* ${music_info.author}`,
                    replyTo: message.id
                });

                // Delete file after sending
                fs.unlinkSync(audioPath);
            }

        } catch (e) {
            console.error('Error in tiktokdl.js:', e);
            reply(`🚨 Failed to download TikTok content.\n${e.message || 'An unknown error occurred.'}`);
        }
    },
};