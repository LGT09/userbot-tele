const axios = require("axios");

module.exports = {
    command: ["gethtml", "html"],
    run: async ({ client, message, text, reply }) => {
        try {
            if (!text) return reply("❌ Please provide a URL.\n\nExample: .gethtml https://example.com");

            // Validate URL
            let url;
            try {
                url = new URL(text.trim());
            } catch {
                return reply("❌ Invalid URL provided.");
            }

            reply("⏳ Fetching HTML...");

            // Fetch HTML
            const response = await axios.get(url.href, { timeout: 15000 });
            let htmlContent = response.data;

            // Limit message size to Telegram limits
            if (htmlContent.length > 4000) {
                htmlContent = htmlContent.substring(0, 3990) + "\n\n...[truncated]";
            }

            await client.sendMessage(message.peerId, {
                message: `📄 HTML source of ${url.href}:\n\n${htmlContent}`,
                replyTo: message.id
            });

        } catch (error) {
            console.error("Error in gethtml.js:", error);
            reply("❌ Failed to fetch HTML. The website might be unreachable.");
        }
    },
};