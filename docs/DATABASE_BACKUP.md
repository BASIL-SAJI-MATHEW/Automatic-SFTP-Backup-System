# DB Backup Setup

The engine seamlessly hooks into your databases before performing the main file transfer, so everything gets archived in a single clean run.

## Requirements
To execute database backups on the local machine running the tool, ensure these are installed in the PATH:
- `mysql-client` (`mysqldump`)
- `postgresql-client` (`pg_dump`)
- `mongodb-database-tools` (`mongodump`)

## How it works:
1. The script reads `databases` from `backup.yml`.
2. It executes internal shell dumps and moves the results into the `backup/tmp` directory.
3. The temporary database dumps are compressed with `tar.gz`.
4. The archive is encrypted using AES-256-CBC (if enabled).
5. The final secure archive is logged and sent.
