import axios from 'axios';
import { logger } from '../utils/logger';

// Developed by Basil Saji Mathew (BSM)

export class DiscordNotifier {
    private static webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    private static isEnabled = process.env.ENABLE_DISCORD === 'true';

    public static async sendAlert(title: string, message: string, color: number = 3447003) {
        if (!this.isEnabled || !this.webhookUrl) return;

        try {
            const payload = {
                username: "BSM Backup Watcher",
                avatar_url: "https://i.imgur.com/Q2rRzU4.png", // Example generic secure logo
                embeds: [
                    {
                        title: title,
                        description: message,
                        color: color,
                        footer: {
                            text: "BSM Automatic SFTP Backup Engine"
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            await axios.post(this.webhookUrl, payload);
            logger.info('[DISCORD] Notification dispatched successfully.');
        } catch (error: any) {
            logger.error(`[DISCORD] Failed to send notification: ${error.message}`);
        }
    }

    public static async sendSuccess(message: string) {
        await this.sendAlert("✅ Backup Success", message, 3066993);
    }

    public static async sendError(message: string) {
        await this.sendAlert("🚨 Backup Error", message, 15158332);
    }
}
