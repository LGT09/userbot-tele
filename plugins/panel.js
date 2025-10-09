const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
    command: ["1gb","2gb","3gb","4gb","5gb","6gb","7gb","10gb","unli"],
    owner: true,
    run: async ({ client, text, reply, message }) => {
        try {
            const fullCommand = message?.message?.trim().split(" ")[0] || "1gb";
            const command = fullCommand.replace(".", "").toLowerCase();

            if (!text || !text.includes(",")) {
                return reply(`❌ Incorrect format!\n\nUsage:\n.${command} username,number`);
            }

            const [username, numberRaw] = text.split(",");
            if (!username || !numberRaw) return reply("❌ Please provide both username and number.");

            const number = numberRaw.replace(/[^0-9]/g, "");
            const password = `${username}001`;
            const email = `${username}@sweetrabit.ml`;

            reply(`⚙️ Creating user and ${command.toUpperCase()} server...`);

            const userRes = await fetch(`${config.domain}/api/application/users`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.apikey}`,
                },
                body: JSON.stringify({
                    email,
                    username,
                    first_name: username,
                    last_name: username,
                    language: "en",
                    password,
                }),
            });

            const userData = await userRes.json();
            if (userData.errors) return reply(`🚫 Failed to create user:\n${JSON.stringify(userData.errors[0], null, 2)}`);
            const user = userData.attributes;

            const eggRes = await fetch(`${config.domain}/api/application/nests/5/eggs/${config.eggsnya}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.apikey}`,
                },
            });

            const eggData = await eggRes.json();
            const startupCmd = eggData.attributes.startup;

            const packages = {
                "1gb": { memory: 1024, cpu: 50, disk: 1024 },
                "2gb": { memory: 2048, cpu: 80, disk: 2048 },
                "3gb": { memory: 3072, cpu: 120, disk: 3072 },
                "4gb": { memory: 4096, cpu: 160, disk: 4096 },
                "5gb": { memory: 5120, cpu: 200, disk: 5120 },
                "6gb": { memory: 6144, cpu: 250, disk: 6144 },
                "7gb": { memory: 7168, cpu: 300, disk: 7168 },
                "10gb": { memory: 10240, cpu: 400, disk: 10240 },
                "unli": { memory: 0, cpu: 0, disk: 0 },
            };

            const pkg = packages[command];
            if (!pkg) return reply("❌ Unknown package.");

            const serverPayload = {
                name: `${username}-${command}`,
                description: `Created via ${config.namabot}`,
                user: user.id,
                egg: parseInt(config.eggsnya),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
                startup: startupCmd,
                environment: {
                    INST: "npm",
                    USER_UPLOAD: "0",
                    AUTO_UPDATE: "0",
                    CMD_RUN: "npm start",
                },
                limits: {
                    memory: pkg.memory,
                    swap: 0,
                    disk: pkg.disk,
                    io: 500,
                    cpu: pkg.cpu,
                },
                feature_limits: {
                    databases: 5,
                    backups: 5,
                    allocations: 5,
                },
                deploy: {
                    locations: [parseInt(config.location)],
                    dedicated_ip: false,
                    port_range: [],
                },
            };

            const serverRes = await fetch(`${config.domain}/api/application/servers`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.apikey}`,
                },
                body: JSON.stringify(serverPayload),
            });

            const serverData = await serverRes.json();
            if (serverData.errors) return reply(`🚫 Failed to create server:\n${JSON.stringify(serverData.errors[0], null, 2)}`);
            const server = serverData.attributes;

            const info = `✅ Successfully created ${command.toUpperCase()} package!

👤 **User Info**
• ID: ${user.id}
• Username: ${user.username}
• Email: ${user.email}
• Password: ${password}

💻 **Server Info**
• Name: ${server.name}
• Memory: ${pkg.memory === 0 ? "Unlimited" : pkg.memory / 1024 + " GB"}
• Disk: ${pkg.disk === 0 ? "Unlimited" : pkg.disk / 1024 + " GB"}
• CPU: ${pkg.cpu === 0 ? "Unlimited" : pkg.cpu + "%"}
• Location ID: ${config.location}

🔗 **Panel URL:** ${config.domain}`;

            await client.sendMessage(message.chatId, { message: info, replyTo: message.id });

        } catch (err) {
            console.error("❌ Error in panel_packages.js:", err);
            reply("🚫 An error occurred while processing your request.");
        }
    },
};