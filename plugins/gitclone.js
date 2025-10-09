const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = {
    command: ["gitclone", "clone"],
    owner: true, // Only bot owner can run this
    run: async ({ client, message, text, reply }) => {
        try {
            if (!text) return reply("❌ Please provide a Git repository URL.\n\nExample: .gitclone https://github.com/user/repo.git");

            const repoUrl = text.trim();
            const repoNameMatch = repoUrl.match(/\/([^\/]+)\.git$/);
            if (!repoNameMatch) return reply("❌ Invalid Git repository URL.");
            
            const repoName = repoNameMatch[1];
            const targetPath = path.resolve(__dirname, "../repos", repoName);

            // Ensure target folder exists
            if (!fs.existsSync(path.dirname(targetPath))) {
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            }

            reply(`⏳ Cloning repository: ${repoUrl}`);

            exec(`git clone ${repoUrl} "${targetPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error("Git clone error:", error);
                    return reply(`❌ Failed to clone repository:\n${error.message}`);
                }

                let messageText = `✅ Successfully cloned repository: ${repoName}\n\n`;
                if (stdout) messageText += `📄 Output:\n${stdout}`;
                if (stderr) messageText += `\n⚠ Warnings/Errors:\n${stderr}`;

                reply(messageText);
            });
        } catch (error) {
            console.error("Error in gitclone.js:", error);
            reply("❌ Something went wrong while cloning the repository.");
        }
    },
};