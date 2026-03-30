import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { logger, logSuccess } from '../utils/logger';
import fs from 'fs';

const execAsync = util.promisify(exec);

// Developed by Basil Saji Mathew (BSM)

export class DbManager {
    public static async dumpMySQL(host: string, port: number, user: string, pass: string, db: string, outputDir: string): Promise<boolean> {
        try {
            const dumpFile = path.join(outputDir, `${db}_mysql_dump.sql`);
            const cmd = `mysqldump -h ${host} -P ${port} -u ${user} -p${pass} ${db} > ${dumpFile}`;
            logger.info(`[DATABASE] Dumping MySQL database: ${db}`);
            await execAsync(cmd);
            logSuccess(`[DATABASE] Dumped ${db} successfully to ${dumpFile}`);
            return true;
        } catch (error: any) {
            logger.error(`[DATABASE] Failed to dump MySQL DB ${db}: ${error.message}`);
            return false;
        }
    }

    public static async dumpPostgres(host: string, port: number, user: string, pass: string, db: string, outputDir: string): Promise<boolean> {
        try {
            const dumpFile = path.join(outputDir, `${db}_postgres_dump.sql`);
            const cmd = `PGPASSWORD="${pass}" pg_dump -h ${host} -p ${port} -U ${user} -d ${db} > ${dumpFile}`;
            logger.info(`[DATABASE] Dumping PostgreSQL database: ${db}`);
            await execAsync(cmd);
            logSuccess(`[DATABASE] Dumped ${db} successfully to ${dumpFile}`);
            return true;
        } catch (error: any) {
            logger.error(`[DATABASE] Failed to dump PostgreSQL DB ${db}: ${error.message}`);
            return false;
        }
    }

    public static async dumpMongo(uri: string, db: string, outputDir: string): Promise<boolean> {
        try {
            const timestamp = Date.now();
            const dumpDir = path.join(outputDir, `${db}_mongo_${timestamp}`);
            const cmd = `mongodump --uri="${uri}" --db="${db}" --out="${dumpDir}"`;
            logger.info(`[DATABASE] Dumping MongoDB database: ${db}`);
            await execAsync(cmd);
            
            // To align with file structure, let's tar it immediately? Handled globally.
            logSuccess(`[DATABASE] Dumped MongoDB ${db} successfully to ${dumpDir}`);
            return true;
        } catch (error: any) {
            logger.error(`[DATABASE] Failed to dump MongoDB DB ${db}: ${error.message}`);
            return false;
        }
    }
}
