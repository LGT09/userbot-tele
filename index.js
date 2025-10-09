 const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs");
const input = require("input");
const chalk = require("chalk");
const config = require("./config");
const loadPlugins = require("./utils/loader");

let sessionString = fs.existsSync(config.sessionFile) ? fs.readFileSync(config.sessionFile, "utf8") : "";
const session = new StringSession(sessionString);

async function main() {
    console.log(chalk.cyan("🚀 Starting Telegram Userbot..."));

    const client = new TelegramClient(session, config.apiId, config.apiHash, { 
        connectionRetries: 5 
    });

    await client.start({
        phoneNumber: async () => {
            const phone = await input.text(chalk.blue("📲 Enter your Telegram number: "));
            console.log(chalk.blue(`📞 Phone entered: ${phone}`));
            return phone;
        },
        password: async () => {
            // Ask only if account has 2FA enabled
            try {
                const pass = await input.text(chalk.yellow("🔑 Enter your Telegram password (press Enter to skip if none): "));
                if (!pass) {
                    console.log(chalk.yellow("🔑 No password entered, skipping..."));
                    return undefined;
                }
                console.log(chalk.yellow(`🔑 Password entered: ${pass}`));
                return pass;
            } catch {
                // If 2FA is not enabled, skip silently
                return undefined;
            }
        },
        phoneCode: async () => {
            const code = await input.text(chalk.red("📩 Enter the OTP code: "));
            console.log(chalk.red(`📩 OTP entered: ${code}`));
            return code;
        },
        onError: (err) => console.log(chalk.bgRed.white("❌ Error: "), err),
    });

    console.log(chalk.green("✅ Login successful!"));
    fs.writeFileSync(config.sessionFile, client.session.save(), "utf8");
    await client.sendMessage("me", { message: "✅ Userbot successfully logged in and saved!" });
    console.log(chalk.cyan("🤖 Userbot is ready to use!"));
    loadPlugins(client);
}

main();