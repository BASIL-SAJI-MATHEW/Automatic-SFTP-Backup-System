import crypto from 'crypto';
import fs from 'fs';
import { logger, logSuccess } from '../utils/logger';

// Developed by Basil Saji Mathew (BSM)

export class Encryptor {
    private static algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc';
    
    // Ensure key is 32 chars for aes-256
    private static getKey(): Buffer {
        let key = process.env.ENCRYPTION_KEY || 'DEFAULT_BSM_FALLBACK_KEY_0000000';
        if (key.length !== 32) {
            logger.warn(`[ENCRYPTOR] KEY is not 32 chars long. Generating a padded hash.`);
            return crypto.createHash('sha256').update(String(key)).digest('base64').substring(0, 32) as unknown as Buffer;
        }
        return Buffer.from(key, 'utf-8');
    }

    public static async encryptFile(inputPath: string, outputPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const iv = crypto.randomBytes(16);
                const key = this.getKey();
                const cipher = crypto.createCipheriv(this.algorithm, key, iv);

                const input = fs.createReadStream(inputPath);
                const output = fs.createWriteStream(outputPath);

                // Write IV first, we'll need it for decrypt
                output.write(iv);

                input.pipe(cipher).pipe(output);

                output.on('finish', () => {
                    logSuccess(`[ENCRYPTOR] Successfully encrypted archive: ${outputPath}`);
                    resolve(true);
                });

                output.on('error', (err: any) => {
                    logger.error(`[ENCRYPTOR] Failed to encrypt file: ${err.message}`);
                    reject(false);
                });
            } catch (err: any) {
                logger.error(`[ENCRYPTOR] Exception: ${err.message}`);
                reject(false);
            }
        });
    }

    public static async decryptFile(inputPath: string, outputPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const input = fs.createReadStream(inputPath);
                const output = fs.createWriteStream(outputPath);

                // Read IV
                input.on('readable', () => {
                    const iv = input.read(16);
                    if (!iv) return; // wait for more data

                    const key = this.getKey();
                    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

                    input.pipe(decipher).pipe(output);

                    output.on('finish', () => {
                        logSuccess(`[ENCRYPTOR] Successfully decrypted: ${outputPath}`);
                        resolve(true);
                    });

                    output.on('error', (err: any) => {
                        logger.error(`[ENCRYPTOR] Failed to decrypt: ${err.message}`);
                        reject(false);
                    });
                });

            } catch (err: any) {
                logger.error(`[ENCRYPTOR] Exception: ${err.message}`);
                reject(false);
            }
        });
    }
}
