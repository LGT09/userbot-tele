const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const config = require("../config");

module.exports = (client) => {
    const pluginsPath = path.join(__dirname, "../plugins");
    const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith(".js"));
    const commands = {};

    pluginFiles.forEach(file => {
        const plugin = require(path.join(pluginsPath, file));
        if (typeof plugin === "function") {
            console.error(`❌ Plugin ${file} does not have the correct format!`);
            return;
        }

        if (!plugin.command) {
            console.error(`❌ Plugin ${file} does not have 'command'.`);
            return;
        }

        plugin.command.forEach(cmd => {
            commands[cmd] = plugin;
        });
        console.log(`✅ Plugin ${file} loaded.`);
    });

    // Load self mode
    const selfFile = path.resolve(__dirname, "../temp/selfMode.json");
    let selfMode = { enabled: false };
    if (fs.existsSync(selfFile)) {
        selfMode = JSON.parse(fs.readFileSync(selfFile, "utf8"));
    }

    // Send startup notice to owner
    client.sendMessage(config.ownerId, {
        message: `🤖 Bot started.\nSelf mode: ${selfMode.enabled ? "ENABLED" : "DISABLED"}`
    }).catch(() => {});

    client.addEventHandler(async (event) => {
        const message = event.message;
        if (!message || !message.message) return;

        const senderId = message.senderId || "Unknown";
        const chatId = message.peerId;

        // Reload self mode in real-time
        if (fs.existsSync(selfFile)) {
            selfMode = JSON.parse(fs.readFileSync(selfFile, "utf8"));
        }

        // Self mode: ignore messages from anyone except owner
        if (selfMode.enabled && parseInt(senderId) !== parseInt(config.ownerId)) return;

        console.log(chalk.bgHex("#e74c3c").bold(`▢ New Message`));
        console.log(
            chalk.bgHex("#00FF00").black(
                `   ⌬ Date: ${new Date().toLocaleString()} \n` +
                `   ⌬ Message: ${message.message} \n` +
                `   ⌬ Telegram ID: ${senderId}`
            )
        );
        console.log();

        let args = message.message.trim().split(/\s+/);
        let command = args.shift().toLowerCase();
        let text = args.join(".");

        const handler = commands[command];
        if (!handler) return;

        // Owner-only commands
        if (handler.owner && parseInt(senderId) !== parseInt(config.ownerId)) {
            return client.sendMessage(chatId, {
                message: "❌ Access denied, you are not the owner",
                replyTo: message.id
            });
        }

        // Handle Self/Public mode toggle notifications
        if (command === "self" || command === "owneronly") {
            await client.sendMessage(config.ownerId, {
                message: `⚠️ Self mode has been ENABLED by owner. Bot will now respond ONLY to the owner.`
            }).catch(() => {});
        } else if (command === "public" || command === "allusers") {
            await client.sendMessage(config.ownerId, {
                message: `✅ Public mode has been ENABLED by owner. Bot will respond to everyone again.`
            }).catch(() => {});
        }

        await handler.run({
            client,
            text,
            reply: (msg) => client.sendMessage(chatId, { 
                message: msg, 
                replyTo: message.id 
            }),
            message,
            senderId,
            isAdmins: message.isGroup ? message.isGroupAdmin : false
        });
    });
};