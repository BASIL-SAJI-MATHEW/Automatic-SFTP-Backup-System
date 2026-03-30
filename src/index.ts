#!/usr/bin/env node

/**
 * BSM Automatic SFTP Backup System
 * Developed by Basil Saji Mathew (BSM)
 * 
 * Secure, modular, enterprise-grade automated backup solution.
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import cron from 'node-cron';
import { BackupManager } from './core/backupManager';
import { loadConfig } from './config';
import { logger } from './utils/logger';

// Load ENV
dotenv.config();

const program = new Command();

program
    .name('bsm-backup')
    .description('BSM Automatic SFTP Backup Engine')
    .version('1.0.0');

program
    .command('backup')
    .description('Triggers an immediate backup across all configured servers')
    .action(async () => {
        logger.info(chalk.cyan('Triggering manual BSM Backup...'));
        await BackupManager.runAllConfigurations();
        process.exit(0);
    });

program
    .command('daemon')
    .description('Starts the BSM Backup Engine scheduling daemon')
    .action(() => {
        const config = loadConfig();
        if (config.backup.scheduling.enabled) {
            logger.info(chalk.green(`Daemon started! Listening for cron: [${config.backup.scheduling.cron}]`));
            
            cron.schedule(config.backup.scheduling.cron, async () => {
                logger.info(chalk.cyan('Executing scheduled BSM Backup...'));
                await BackupManager.runAllConfigurations();
            });

            // Keep process alive
            setInterval(() => {}, 1 << 30);
        } else {
            logger.warn('Scheduling is disabled in config. Backup Daemon exiting.');
            process.exit(0);
        }
    });

program
    .command('status')
    .description('Displays current system configuration status')
    .action(() => {
        const config = loadConfig();
        console.log(chalk.blue.bold('\n=== BSM Backup Engine Status ===\n'));
        console.log(`Environment:  ${chalk.green(config.global.environment)}`);
        console.log(`Log Level:    ${chalk.green(config.global.log_level)}`);
        console.log(`Encryption:   ${config.backup.encrypt ? chalk.green('ENABLED') : chalk.red('DISABLED')}`);
        console.log(`Discord Hook: ${process.env.ENABLE_DISCORD === 'true' ? chalk.green('ENABLED') : chalk.red('DISABLED')}`);
        console.log(`Cron:         ${config.backup.scheduling.cron} (${config.backup.scheduling.enabled ? chalk.green('ACTIVE') : chalk.red('INACTIVE')})\n`);
        console.log(chalk.bold('Registered Servers:'));
        config.servers.forEach(srv => {
            console.log(` - ${srv.name} (${srv.host}) - ${srv.enabled ? chalk.green('[ON]') : chalk.gray('[OFF]')}`);
        });
        console.log('\n================================\n');
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
