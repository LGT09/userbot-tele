const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["igdl", "instagram"],
    run: async ({ client, text, reply, message }) => {
        if (!text) return reply("Example: igdl https://www.instagram.com/p/CYR... or https://www.instagram.com/stories/username/...");

        // Regex to detect Instagram URL (Post, Reel, TV, and Story)
        const instagramUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:(?:p|reel|tv)\/([a-zA-Z0-9_-]+)|stories\/([a-zA-Z0-9_.]+)\/(\d+))/i;

        if (!instagramUrlRegex.test(text)) {
            return reply('🚨 Please enter a valid Instagram URL (Post/Reel/TV/Story).\n\nExample: https://www.instagram.com/p/... or https://www.instagram.com/stories/username/...');
        }

        // Function to fetch data from Snapins API
        async function fetchFromSnapins(url) {
            try {
                const { data } = await axios.post('https://snapins.ai/action.php',
                    { url: url },
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Origin': 'https://snapins.ai',
                            'Referer': 'https://snapins.ai/',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
                        }
                    }
                );

                if (data.status !== 'success' || !data.data || data.data.length === 0) {
                    throw new Error('Media not found. The link might be private or invalid.');
                }

                return data.data;

            } catch (error) {
                console.error('Error on Snapins API:', error.response ? error.response.data : error.message);
                throw error;
            }
        }

        try {
            reply('⏳ Searching for media, please wait...');
            
            // Call API with the user-provided URL
            const mediaList = await fetchFromSnapins(text);

            if (!mediaList || mediaList.length === 0) {
                return reply('🚫 No media found to download.');
            }

            // Prepare temp folder
            const tempDir = path.resolve(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Loop to download and send each media
            for (let i = 0; i < mediaList.length; i++) {
                const media = mediaList[i];
                const mediaUrl = media.downloadUrl;
                const caption = i === 0 ? '✅ *Instagram Downloader*' : ''; // Only send caption for the first media

                let filePath, fileExtension;

                if (media.type === 'image') {
                    fileExtension = '.jpg';
                } else if (media.type === 'video') {
                    fileExtension = '.mp4';
                } else {
                    // Skip if media type is unknown
                    continue;
                }

                // Create a unique file path
                const fileName = `ig_${Date.now()}_${i}${fileExtension}`;
                filePath = path.join(tempDir, fileName);

                // Download file
                const fileData = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
                fs.writeFileSync(filePath, fileData.data);

                // Send file to user
                await client.sendMessage(message.peerId, {
                    file: filePath,
                    caption: caption,
                    replyTo: message.id
                });

                // Delete file after sending
                try {
                    fs.unlinkSync(filePath);
                } catch (cleanupError) {
                    console.error("Failed to delete file:", cleanupError);
                }

                // Wait 1 second to avoid rate limits
                if (i < mediaList.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

        } catch (e) {
            console.error('Error in igdl.js:', e);
            reply(`🚨 Download failed.\n${e.message || 'An unknown error occurred.'}`);
        }
    },
};