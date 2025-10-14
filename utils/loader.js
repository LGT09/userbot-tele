const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const chokidar = require("chokidar");
const config = require("../config");

module.exports = (client) => {
    const pluginsPath = path.join(__dirname, "../plugins");
    let commands = {};

    // Helper to load a single plugin
    const loadPlugin = (file) => {
        const pluginPath = path.join(pluginsPath, file);

        try {
            delete require.cache[require.resolve(pluginPath)];
            const plugin = require(pluginPath);

            if (!plugin || typeof plugin.run !== "function") {
                console.error(chalk.red(`❌ Plugin ${file} has no valid "run" function.`));
                return;
            }

            if (!plugin.command || !Array.isArray(plugin.command)) {
                console.error(chalk.red(`❌ Plugin ${file} missing "command" array.`));
                return;
            }

            plugin.command.forEach(cmd => {
                commands[cmd] = plugin;
            });

            console.log(chalk.green(`✅ Loaded plugin: ${file}`));
        } catch (err) {
            console.error(chalk.red(`❌ Failed to load plugin ${file}:`), err);
        }
    };

    // Helper to unload plugin
    const unloadPlugin = (file) => {
        const pluginPath = path.join(pluginsPath, file);
        try {
            delete require.cache[require.resolve(pluginPath)];
            Object.keys(commands).forEach(cmd => {
                if (commands[cmd].file === file) delete commands[cmd];
            });
            console.log(chalk.red(`🗑️ Unloaded plugin: ${file}`));
        } catch (err) {
            console.error(chalk.red(`⚠️ Failed to unload ${file}:`), err);
        }
    };

    // Initial load
    fs.readdirSync(pluginsPath)
        .filter(file => file.endsWith(".js"))
        .forEach(loadPlugin);

    // Watch for plugin updates
    const watcher = chokidar.watch(pluginsPath, { ignoreInitial: true });

    watcher
        .on("change", filePath => {
            const file = path.basename(filePath);
            console.log(chalk.yellow(`🔁 Plugin updated: ${file}`));
            loadPlugin(file);
        })
        .on("add", filePath => {
            const file = path.basename(filePath);
            console.log(chalk.green(`🆕 New plugin added: ${file}`));
            loadPlugin(file);
        })
        .on("unlink", filePath => {
            const file = path.basename(filePath);
            unloadPlugin(file);
        });

    // Load self mode
    const selfFile = path.resolve(__dirname, "../temp/selfMode.json");
    let selfMode = { enabled: false };
    if (fs.existsSync(selfFile)) {
        selfMode = JSON.parse(fs.readFileSync(selfFile, "utf8"));
    }

    // Notify owner
    client.sendMessage(config.ownerId, {
        message: `🤖 Bot started.\nSelf mode: ${selfMode.enabled ? "ENABLED" : "DISABLED"}`
    }).catch(() => {});

    client.addEventHandler(async (event) => {
        const message = event.message;
        if (!message || !message.message) return;

        const senderId = message.senderId || "Unknown";
        const chatId = message.peerId;

        // Refresh self mode on every message
        if (fs.existsSync(selfFile)) {
            selfMode = JSON.parse(fs.readFileSync(selfFile, "utf8"));
        }

        // Self mode = ignore all except owner
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

        const args = message.message.trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        const text = args.join(" ");

        const handler = commands[command];
        if (!handler) return;

        // Owner-only commands
        if (handler.owner && parseInt(senderId) !== parseInt(config.ownerId)) {
            return client.sendMessage(chatId, {
                message: "❌ Access denied, you are not the owner",
                replyTo: message.id
            });
        }

        // Handle mode notifications
        if (["self", "owneronly"].includes(command)) {
            await client.sendMessage(config.ownerId, {
                message: `⚠️ Self mode ENABLED — bot responds only to owner.`
            }).catch(() => {});
        } else if (["public", "allusers"].includes(command)) {
            await client.sendMessage(config.ownerId, {
                message: `✅ Public mode ENABLED — bot responds to everyone.`
            }).catch(() => {});
        }

        try {
            await handler.run({
                client,
                text,
                reply: (msg) => client.sendMessage(chatId, { message: msg, replyTo: message.id }),
                message,
                senderId,
                isAdmins: message.isGroup ? message.isGroupAdmin : false
            });
        } catch (err) {
            console.error(chalk.red(`⚠️ Error in ${command}:`), err);
            client.sendMessage(chatId, { message: "❌ Command execution failed.", replyTo: message.id });
        }
    });

    console.log(chalk.cyan("👀 Watching for plugin updates..."));
};