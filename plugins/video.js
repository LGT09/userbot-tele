const axios = require("axios");
const yts = require("yt-search");

module.exports = {
    command: ["video", "ytvideo"],
    help: ["video <YouTube link or query>"],
    tags: ["downloader"],

    run: async ({ client, text, reply, message }) => {
        try {
            if (!text) return reply("⚠️ Please provide a YouTube link or search query.");

            let videoUrl = "";
            let videoTitle = "";

            // Check if input is a URL
            if (text.startsWith("http://") || text.startsWith("https://")) {
                videoUrl = text;
            } else {
                // Search YouTube if not a URL
                const { videos } = await yts(text);
                if (!videos || videos.length === 0) return reply("🚫 No videos found!");
                videoUrl = videos[0].url;
                videoTitle = videos[0].title;
            }

            const izumiBaseURL = "https://izumiiiiiiii.dpdns.org";
            const AXIOS_DEFAULTS = {
                timeout: 60000,
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json, text/plain, */*"
                }
            };

            const tryRequest = async (getter, attempts = 3) => {
                let lastError;
                for (let i = 1; i <= attempts; i++) {
                    try {
                        return await getter();
                    } catch (err) {
                        lastError = err;
                        if (i < attempts) await new Promise(r => setTimeout(r, 1000 * i));
                    }
                }
                throw lastError;
            };

            const getIzumiVideoByUrl = async (url) => {
                const res = await tryRequest(() => axios.get(`${izumiBaseURL}/downloader/youtube?url=${encodeURIComponent(url)}&format=720`, AXIOS_DEFAULTS));
                if (res?.data?.result?.download) return res.data.result;
                throw new Error("Izumi API returned no download");
            };

            // Validate YouTube URL
            const urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
            if (!urls) return reply("❌ This is not a valid YouTube link!");

            // Download video
            let videoData;
            try {
                videoData = await getIzumiVideoByUrl(videoUrl);
            } catch (err) {
                console.warn("[VIDEO] Izumi failed:", err?.message || err);
                return reply("❌ Failed to download video.");
            }

            // Send video WITHOUT thumbnail and WITHOUT parseMode
            await client.sendMessage(message.peerId, {
                file: videoData.download, // URL from API
                caption: videoData.title || videoTitle || "YouTube Video",
                replyTo: message.id
            });

        } catch (error) {
            console.error("[VIDEO] Command Error:", error?.message || error);
            reply("❌ Download failed: " + (error?.message || "Unknown error"));
        }
    }
};