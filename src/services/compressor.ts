import archiver from 'archiver';
import fs from 'fs';
import { logger } from '../utils/logger';

// Developed by Basil Saji Mathew (BSM)

export class Compressor {
    public static async compress(sourcePath: string, destPath: string, format: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!['zip', 'tar', 'tar.gz'].includes(format)) {
                logger.error(`[COMPRESSOR] Unsupported format: ${format}`);
                return reject(false);
            }

            const isTarGz = format === 'tar.gz';
            const output = fs.createWriteStream(destPath);
            const archive = archiver(isTarGz ? 'tar' : (format as archiver.Format), {
                zlib: { level: 9 }, // Maximum compression
                gzip: isTarGz,
                gzipOptions: { level: 9 }
            });

            output.on('close', () => {
                logger.info(`[COMPRESSOR] Archive built: ${archive.pointer()} total bytes.`);
                resolve(true);
            });

            archive.on('error', (err: any) => {
                logger.error(`[COMPRESSOR] Error: ${err.message}`);
                reject(err);
            });

            archive.pipe(output);
            
            // Determine if it's a file or directory
            if (fs.existsSync(sourcePath)) {
                if (fs.lstatSync(sourcePath).isDirectory()) {
                    archive.directory(sourcePath, false);
                } else {
                    archive.file(sourcePath, { name: require('path').basename(sourcePath) });
                }
            } else {
                logger.error(`[COMPRESSOR] Source path not found: ${sourcePath}`);
                return reject(false);
            }

            archive.finalize();
        });
    }
}
