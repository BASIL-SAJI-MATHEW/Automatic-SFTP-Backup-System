import winston from 'winston';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Developed by Basil Saji Mathew (BSM)

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// BSM Custom Logger Formatter
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    let colorizedLevel = level.toUpperCase();
    if (level === 'info') colorizedLevel = chalk.blue(`[${level.toUpperCase()}]`);
    if (level === 'warn') colorizedLevel = chalk.yellow(`[${level.toUpperCase()}]`);
    if (level === 'error') colorizedLevel = chalk.red(`[${level.toUpperCase()}]`);
    if (level === 'success') colorizedLevel = chalk.green(`[SUCCESS]`); // custom map

    return `${chalk.gray(timestamp)} ${colorizedLevel}: ${message}`;
});

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'bsm-backup-engine' },
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                customFormat
            )
        })
    ]
});

// Adding a custom wrapper for "success" visually
export const logSuccess = (message: string) => {
    logger.info(chalk.green(message));
};
