import Client from 'ssh2-sftp-client';
import { logger, logSuccess } from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Developed by Basil Saji Mathew (BSM)

export class SftpService {
    private client: Client;
    private serverId: string;

    constructor(serverId: string) {
        this.client = new Client();
        this.serverId = serverId;
    }

    public async connect(config: any): Promise<boolean> {
        try {
            logger.info(`[${this.serverId}] Connecting to SFTP ${config.host}:${config.port}...`);
            await this.client.connect({
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password,
                privateKey: config.private_key ? fs.readFileSync(config.private_key) : undefined
            });
            logSuccess(`[${this.serverId}] Successfully connected to SFTP server.`);
            return true;
        } catch (error: any) {
            logger.error(`[${this.serverId}] SFTP Connection failed: ${error.message}`);
            return false;
        }
    }

    public async downloadDirectory(remotePath: string, localPath: string): Promise<boolean> {
        try {
            logger.info(`[${this.serverId}] Pulling directory: ${remotePath} -> ${localPath}`);
            await this.client.downloadDir(remotePath, localPath);
            logSuccess(`[${this.serverId}] Pulled directory ${remotePath} successfully!`);
            return true;
        } catch (error: any) {
            logger.error(`[${this.serverId}] Error downloading ${remotePath}: ${error.message}`);
            return false;
        }
    }

    public async disconnect() {
        await this.client.end();
        logger.info(`[${this.serverId}] Disconnected from SFTP server.`);
    }
}
