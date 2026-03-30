# Getting Started with BSM Backup System

Welcome to the most advanced SFTP Backup Engine! 🚀

## Prerequisites
- Node.js (v18+)
- Local execution environment with access to remote VPS over SSH/SFTP
- MongoDB/MySQL/PostgreSQL CLI tools installed locally if Database dumping is enabled (`mysqldump`, `pg_dump`, `mongodump`).

## Quick Boot
1. Run `npm install`
2. Configure `.env` using `.env.example`
3. Edit `config/backup.yml` to define your target servers
4. Run `npm run build`
5. Test it using `npm run start -- backup`
