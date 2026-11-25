<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  <h1>🛡️ BSM Automatic SFTP Backup System</h1>
  <p>A modular, configurable SFTP backup engine for multi-server VPS environments.</p>
  <p><strong>Developed & Watermarked by Basil Saji Mathew (BSM)</strong></p>
</div>

---

## 🚀 Overview

The **BSM Automatic SFTP Backup System** is a configurable automated backup suite designed for multi-server enterprise environments. Engineered with zero compromises on security and efficiency, it powers dynamic file retention, deep compression, military-grade encryption, and real-time Discord notifications. 

## ✨ Features

- 🌐 **Multi-Server Multi-Destination**: Unlimited remote nodes. Pull/Push data across VPS clusters.
- 🗄️ **Smart Database Archiver**: Auto-detects and dumps MySQL, PostgreSQL, and MongoDB bases.
- 📦 **Dynamic Compression**: Zlib integration supporting `.zip`, `.tar`, and `.tar.gz`.
- 🔐 **AES-256 Encryption**: Rest easy knowing your archives are encrypted at rest with AES-256.
- 🧹 **Auto-Cleanup / Retention Engine**: Self-managing file retention policies (Date, Count, or Size-based).
- 🕒 **Granular Schedulers**: Supports internal CRON patterns and real-time syncing.
- 🤖 **Discord Webhook Alerts**: Detailed alerts natively to your admin Discord channels (Success, Failure, Warnings).

## 📊 Quick Screenshots
*(Placeholders for future UI / Console logs)*
`> [SUCCESS] [vps-01-web] Archive created: /backups/archives/vps-01-web-1682910.tar.gz`
`> [SUCCESS] BSM Webhook sent to #alerts channel.`

## 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/YourUsername/BSM-Automatic-SFTP-Backup.git
cd BSM-Automatic-SFTP-Backup

# 2. Install Dependencies
npm install

# 3. Setup Configurations
cp .env.example .env
cp config/backup.yml config/backup-production.yml

# 4. Build TypeScript
npm run build
```

## ⚙️ Configuration

Check `./config/backup.yml` to define your target servers, scheduling, and cleanup logic. Check `.env` for your Database Credentials, Secrets, and Discord hook keys.

> **Note:** The configuration system accepts recursive directories. Glob matching is active!

## 💻 Usage 

```bash
# Run manual full-backup immediately
npm run start -- --mode full 

# Start scheduled daemon via CRON
npm run start -- --daemon

# Validate configurations
npm run validate
```

## 🔒 Security Notes
- Keys and `.env` files are in `.gitignore`. **Never commit these!**
- Ensure SSH Key pairs are minimum RSA-4096 or Ed25519.

## 🤝 Contribution
See `CONTRIBUTING.md` for our enterprise contribution ladder. 

## 📝 License
MIT License - Copyright (c) 2026 Basil Saji Mathew (BSM)
