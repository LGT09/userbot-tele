module.exports = {
    command: ["fancy", "stylize"],
    run: async ({ client, message, reply, text }) => {
        try {
            if (!text) return reply("❌ Please provide text to stylize.\n\nExample: .fancy Hello World");

            // Simple fancy transformations
            const styles = {
                "bold": (s) => s.split("").map(c => String.fromCodePoint(c.charCodeAt(0) + 0x1D400 - 65)).join(""),
                "italic": (s) => s.split("").map(c => String.fromCodePoint(c.charCodeAt(0) + 0x1D434 - 65)).join(""),
                "bubble": (s) => s.replace(/[A-Za-z0-9]/g, c => {
                    const code = c.charCodeAt(0);
                    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F150 + code - 65); // A-Z bubble
                    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F170 + code - 97); // a-z bubble
                    if (code >= 48 && code <= 57) return String.fromCodePoint(0x2460 + code - 49); // 0-9 bubble
                    return c;
                }),
                "reverse": (s) => s.split("").reverse().join("")
            };

            // Apply all styles
            let output = "📝 Fancy Styles:\n\n";
            for (const style in styles) {
                output += `• ${style}: ${styles[style](text)}\n`;
            }

            reply(output);

        } catch (error) {
            console.error("Error in fancy.js:", error);
            reply("❌ Failed to stylize text.");
        }
    },
};