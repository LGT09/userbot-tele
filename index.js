 const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs");
const input = require("input");
const chalk = require("chalk");
const config = require("./config");
const loadPlugins = require("./utils/loader");

let sessionString = fs.existsSync(config.sessionFile)
  ? fs.readFileSync(config.sessionFile, "utf8")
  : "";

const session = new StringSession(sessionString);

async function main() {
    console.log(chalk.cyan("🚀 Starting Telegram Userbot..."));

    const client = new TelegramClient(session, config.apiId, config.apiHash, { connectionRetries: 5 });

    await client.start({
        phoneNumber: async () => await input.text(chalk.blue("📲 Enter your Telegram number: ")),
        password: async () => await input.text(chalk.yellow("🔑 Enter password (press Enter to skip): ")),
        phoneCode: async () => await input.text(chalk.red("📩 Enter OTP code: ")),
        onError: (err) => console.log(chalk.bgRed.white("❌ Error: "), err),
    });

    console.log(chalk.green("✅ Login successful!"));
    fs.writeFileSync(config.sessionFile, client.session.save(), "utf8");
    await client.sendMessage("me", { message: "✅ Userbot successfully logged in and saved!" });

    console.log(chalk.cyan("🤖 Userbot is ready to use!"));

    // ✅ Load plugins and enable hot reloading
    if (process.env.NODE_ENV !== "production") {
        loadPlugins(client);
        console.log(chalk.blue("👀 Watching for plugin updates..."));
    } else {
        console.log(chalk.yellow("🚀 Production mode: Live plugin reload disabled."));
        loadPlugins(client);
    }
}

main();