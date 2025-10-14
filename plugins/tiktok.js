const fg = require("api-dylux");

module.exports = {
    command: ["tiktok"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("⚠️ Use: tiktok <tiktok-link>");

        reply("⏳ Downloading TikTok video...");

        try {
            // Fetch TikTok data
            const data = await fg.tiktok(text);
            const json = data.result;

            // Caption
            let caption = `🎵 *TIKTOK DOWNLOAD*\n\n`;
            caption += `◦ *ID:* ${json.id}\n`;
            caption += `◦ *Username:* ${json.author.nickname}\n`;
            caption += `◦ *Title:* ${json.title}\n`;
            caption += `◦ *Likes:* ${json.digg_count}\n`;
            caption += `◦ *Comments:* ${json.comment_count}\n`;
            caption += `◦ *Shares:* ${json.share_count}\n`;
            caption += `◦ *Plays:* ${json.play_count}\n`;
            caption += `◦ *Created:* ${json.create_time}\n`;
            caption += `◦ *Size:* ${json.size}\n`;
            caption += `◦ *Duration:* ${json.duration}s`;

            // If it’s an image slide TikTok
            if (json.images && json.images.length > 0) {
                for (const imgUrl of json.images) {
                    await client.sendMessage(message.peerId, {
                        message: "🖼 TikTok Image Slide",
                        file: imgUrl, // send direct URL, not object
                        replyTo: message.id
                    });
                }
            } else {
                // Send video
                await client.sendMessage(message.peerId, {
                    message: caption,
                    file: json.play, // direct URL
                    caption,
                    replyTo: message.id
                });

                // Send music after 3 seconds
                setTimeout(async () => {
                    await client.sendMessage(message.peerId, {
                        message: "🎧 TikTok Original Sound",
                        file: json.music, // direct URL
                        replyTo: message.id
                    });
                }, 3000);
            }
        } catch (err) {
            console.error(err);
            reply("❌ Failed to download TikTok video. Please try again later.");
        }
    },
};
        

            
            
                    