const { Api } = require("telegram");

module.exports = {
    command: ["add", "remove", "promote", "demote"],
    owner: true, // Only owner can use admin commands
    run: async ({ client, text, message, reply }) => {
        if (!text) return reply("❌ Please provide a username or user ID.");

        const chatId = message.peerId;
        const cmd = message.message.trim().split(/\s+/)[0].substring(1).toLowerCase(); // removes prefix

        try {
            const user = await client.getEntity(text.trim());

            switch (cmd) {
                case "add":
                    await client.invoke(
                        new Api.channels.InviteToChannel({
                            channel: chatId,
                            users: [user],
                        })
                    );
                    reply(`✅ Successfully added ${text} to the group.`);
                    break;

                case "remove":
                    await client.invoke(
                        new Api.channels.EditBanned({
                            channel: chatId,
                            participant: user,
                            bannedRights: {
                                viewMessages: true,
                                sendMessages: true,
                                sendMedia: true,
                                sendStickers: true,
                                sendGifs: true,
                                sendGames: true,
                                sendInline: true,
                                embedLinks: true,
                            },
                        })
                    );
                    reply(`✅ Successfully removed ${text} from the group.`);
                    break;

                case "promote":
                    await client.invoke(
                        new Api.channels.EditAdmin({
                            channel: chatId,
                            userId: user,
                            adminRights: {
                                changeInfo: true,
                                postMessages: true,
                                editMessages: true,
                                deleteMessages: true,
                                banUsers: true,
                                inviteUsers: true,
                                pinMessages: true,
                                addAdmins: false,
                            },
                            rank: "Admin",
                        })
                    );
                    reply(`✅ Successfully promoted ${text} to admin.`);
                    break;

                case "demote":
                    await client.invoke(
                        new Api.channels.EditAdmin({
                            channel: chatId,
                            userId: user,
                            adminRights: {
                                changeInfo: false,
                                postMessages: false,
                                editMessages: false,
                                deleteMessages: false,
                                banUsers: false,
                                inviteUsers: false,
                                pinMessages: false,
                                addAdmins: false,
                            },
                            rank: "",
                        })
                    );
                    reply(`✅ Successfully demoted ${text} from admin.`);
                    break;

                default:
                    reply("❌ Unknown command.");
            }
        } catch (err) {
            console.error("❌ Admin command failed:", err);
            reply(`❌ Could not execute ${cmd} on ${text}. Make sure the bot is admin and the user is in the group.`);
        }
    },
};