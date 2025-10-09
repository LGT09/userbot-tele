const fs = require("fs");
const path = require("path");

module.exports = {
    command: ["getdp", "profilepic"],
    run: async ({ client, message, reply, text }) => {
        try {
            let userId;

            // Determine which user to fetch
            if (text) {
                // If user provides username or ID
                userId = text.startsWith("@") ? text.slice(1) : text;
            } else {
                // Default to sender
                userId = message.senderId;
            }

            // Fetch user entity
            const user = await client.getEntity(userId);
            if (!user) return reply("❌ User not found.");

            // Fetch profile photos
            const photos = await client.getProfilePhotos(user.id, { limit: 1 });
            if (!photos || photos.length === 0) return reply("❌ User has no profile photo.");

            // Prepare file path
            const tempDir = path.resolve(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const dpPath = path.join(tempDir, `dp_${user.id}_${Date.now()}.jpg`);

            // Download the highest resolution profile photo
            const photoFile = await client.downloadMedia(photos[0], dpPath);

            // Send the profile photo
            await client.sendMessage(message.peerId, {
                file: dpPath,
                caption: `📸 Profile picture of ${user.firstName}${user.lastName ? " " + user.lastName : ""}`,
                replyTo: message.id
            });

            // Clean up
            fs.unlinkSync(dpPath);

        } catch (error) {
            console.error("Error in getdp.js:", error);
            reply("❌ Failed to fetch profile picture. Make sure the user exists and has a DP.");
        }
    },
};