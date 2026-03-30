# Discord Webhook AI Integration

The system comes with native Discord alerting!

## Activating
1. Go to your Admin Discord Server -> Channel Settings -> Integrations -> Webhooks -> Create Webhook.
2. Copy the URL.
3. Paste it in `.env` as `DISCORD_WEBHOOK_URL=...`
4. Set `ENABLE_DISCORD=true`

Now, whenever a backup completes, fails, or warns, your channel will receive a professionally formatted embedded message alerting the administrators.
