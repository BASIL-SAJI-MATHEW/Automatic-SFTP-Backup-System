import fs from 'fs';
import path from 'path';
import { logger, logSuccess } from '../utils/logger';
import { loadConfig } from '../config';

// Developed by Basil Saji Mathew (BSM)

export class RetentionManager {
    public static async runCleanup() {
        const config = loadConfig();
        const baseArch = path.resolve(config.global.backup_dir);

        if (!fs.existsSync(baseArch)) {
            logger.warn('[RETENTION] Archive directory does not exist yet. Bypassing cleanup.');
            return;
        }

        const maxAgeDays = config.backup.retention.max_age_days;
        const maxCount = config.backup.retention.max_count;

        logger.info(`[RETENTION] Running auto-cleanup engine... Max Age: ${maxAgeDays} days, Max Count: ${maxCount}`);

        const files = fs.readdirSync(baseArch)
            .map(file => {
                const filePath = path.join(baseArch, file);
                const stats = fs.statSync(filePath);
                return { file, filePath, mtime: stats.mtime, isFile: stats.isFile() };
            })
            .filter(f => f.isFile)
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Newest first

        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        let deletedCount = 0;

        // Cleanup based on Max Count
        if (files.length > maxCount) {
            const overstockFiles = files.slice(maxCount);
            overstockFiles.forEach(f => {
                fs.unlinkSync(f.filePath);
                deletedCount++;
                logger.info(`[RETENTION] Purged (Over Max Count): ${f.file}`);
            });
        }

        // Re-evaluate files after max count deletion
        const remainingFiles = files.slice(0, maxCount);

        // Cleanup based on Max Age
        remainingFiles.forEach(f => {
            const ageDays = (now - f.mtime.getTime()) / oneDayMs;
            if (ageDays > maxAgeDays) {
                fs.unlinkSync(f.filePath);
                deletedCount++;
                logger.info(`[RETENTION] Purged (Over Max Age): ${f.file} (${Math.round(ageDays)} days old)`);
            }
        });

        if (deletedCount > 0) {
            logSuccess(`[RETENTION] Cleanup complete. Removed ${deletedCount} ancient backups.`);
        } else {
            logger.info('[RETENTION] Cleanup complete. No files met the purge criteria.');
        }
    }
}
