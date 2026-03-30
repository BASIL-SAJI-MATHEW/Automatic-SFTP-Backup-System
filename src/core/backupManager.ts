import fs from 'fs';
import path from 'path';
import { loadConfig } from '../config';
import { SftpService } from '../services/sftp';
import { Compressor } from '../services/compressor';
import { Encryptor } from '../services/encryptor';
import { DiscordNotifier } from '../services/discord';
import { RetentionManager } from './cleanup';
import { DbManager } from '../database/dbManager';
import { logger, logSuccess } from '../utils/logger';
import chalk from 'chalk';

// Developed by Basil Saji Mathew (BSM)

export class BackupManager {
    public static async runAllConfigurations() {
        const config = loadConfig();
        const baseTmp = path.resolve(config.global.temp_dir);
        const baseArch = path.resolve(config.global.backup_dir);

        // Ensure directories exist
        if (!fs.existsSync(baseTmp)) fs.mkdirSync(baseTmp, { recursive: true });
        if (!fs.existsSync(baseArch)) fs.mkdirSync(baseArch, { recursive: true });

        logger.info(chalk.magenta('=== Initiating BSM Global Backup Cycle ==='));

        // Handle Database Dumps locally first if configured
        if (config.databases && config.databases.enabled) {
            logger.info('[DATABASE] Processing databases backing up routines...');
            const dbTmp = path.join(baseTmp, 'databases');
            if (!fs.existsSync(dbTmp)) fs.mkdirSync(dbTmp, { recursive: true });

            if (config.databases.mysql && config.databases.mysql.length) {
                for (const dbOpts of config.databases.mysql) {
                    for (const dbName of dbOpts.databases) {
                        await DbManager.dumpMySQL(dbOpts.host, dbOpts.port, process.env.DB_USER_MYSQL!, process.env.DB_PASS_MYSQL!, dbName, dbTmp);
                    }
                }
            }

            // PostgreSQL
            if (config.databases.postgres && config.databases.postgres.length) {
                for (const dbOpts of config.databases.postgres) {
                    for (const dbName of dbOpts.databases) {
                        await DbManager.dumpPostgres(dbOpts.host, dbOpts.port, process.env.DB_USER_POSTGRES!, process.env.DB_PASS_POSTGRES!, dbName, dbTmp);
                    }
                }
            }

            // MongoDB
            if (config.databases.mongodb && config.databases.mongodb.length) {
                for (const dbOpts of config.databases.mongodb) {
                    for (const dbName of dbOpts.databases) {
                        await DbManager.dumpMongo(dbOpts.uri, dbName, dbTmp);
                    }
                }
            }
            
            // Compress DB Dumps into an archive
            const ts = Date.now();
            const format = config.backup.compression.format === 'tar.gz' ? 'tar.gz' : config.backup.compression.format;
            const dbArch = path.join(baseArch, `databases-${ts}.${format}`);
            await Compressor.compress(dbTmp, dbArch, config.backup.compression.format);
            fs.rmSync(dbTmp, { recursive: true, force: true });
            
            if (config.backup.encrypt) {
                const encDbArch = `${dbArch}.enc`;
                await Encryptor.encryptFile(dbArch, encDbArch);
                fs.unlinkSync(dbArch);
            }
        }

        for (const server of config.servers) {
            if (!server.enabled) {
                logger.info(`[${server.id}] Server is disabled, skipping.`);
                continue;
            }

            try {
                logger.info(`[${server.id}] Starting backup sequence for ${server.host}`);
                const sftp = new SftpService(server.id);
                
                const connected = await sftp.connect(server);
                if (!connected) {
                    await DiscordNotifier.sendError(`[${server.id}] Target is unreachable. Skipping.`);
                    continue;
                }

                // Temporary directory for this server
                const serverTmp = path.join(baseTmp, server.id);
                if (!fs.existsSync(serverTmp)) fs.mkdirSync(serverTmp, { recursive: true });

                for (const remotePath of server.source_paths) {
                    const localPath = path.join(serverTmp, path.basename(remotePath));
                    await sftp.downloadDirectory(remotePath, localPath);
                }

                await sftp.disconnect();

                // Compress
                const timestamp = Date.now();
                const ext = config.backup.compression.format === 'tar.gz' ? 'tar.gz' : config.backup.compression.format;
                const archiveName = `${server.id}-${timestamp}.${ext}`;
                const archivePath = path.join(baseArch, archiveName);

                await Compressor.compress(serverTmp, archivePath, config.backup.compression.format);
                
                let finalPath = archivePath;

                // Encrypt
                if (config.backup.encrypt) {
                    const encPath = `${archivePath}.enc`;
                    await Encryptor.encryptFile(archivePath, encPath);
                    fs.unlinkSync(archivePath); // Delete unencrypted archive
                    finalPath = encPath;
                }

                // Cleanup TMP
                fs.rmSync(serverTmp, { recursive: true, force: true });

                logSuccess(`[${server.id}] Complete! Output: ${finalPath}`);
                await DiscordNotifier.sendSuccess(`[${server.id}] Backup successfully generated. Target archive: \`${path.basename(finalPath)}\``);

            } catch (err: any) {
                logger.error(`[${server.id}] Aborted: ${err.message}`);
                await DiscordNotifier.sendError(`[${server.id}] Critical Failure: ${err.message}`);
            }
        }

        // Post Backup Cleanup Routine
        await RetentionManager.runCleanup();

        logger.info(chalk.magenta('=== BSM Global Backup Cycle Complete ==='));
    }
}
