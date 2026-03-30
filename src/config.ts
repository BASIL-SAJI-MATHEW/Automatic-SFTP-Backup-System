import yaml from 'yaml';
import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';

// Developed by Basil Saji Mathew (BSM)

export interface ServerConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    private_key?: string;
    enabled: boolean;
    source_paths: string[];
    exclude_paths: string[];
}

export interface BackupConfig {
    global: {
        environment: string;
        log_level: string;
        temp_dir: string;
        backup_dir: string;
    };
    servers: ServerConfig[];
    databases?: {
        enabled: boolean;
        mysql?: { host: string; port: number; databases: string[] }[];
        postgres?: { host: string; port: number; databases: string[] }[];
        mongodb?: { uri: string; databases: string[] }[];
    };
    backup: {
        mode: string;
        compression: {
            enabled: boolean;
            format: string;
        };
        encrypt: boolean;
        scheduling: {
            enabled: boolean;
            cron: string;
        };
        retention: {
            max_age_days: number;
            max_count: number;
        };
    };
    notifications: {
        discord: boolean;
        email: boolean;
    };
}

export const loadConfig = (): BackupConfig => {
    const configPath = path.join(__dirname, '../../config/backup.yml');
    try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const parsed = yaml.parse(fileContent) as BackupConfig;
        return parsed;
    } catch (error: any) {
        logger.error(`Failed to load BSM configuration: ${error.message}`);
        process.exit(1);
    }
};
