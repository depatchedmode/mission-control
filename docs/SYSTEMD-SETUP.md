# Mission Control Systemd Setup

## Overview

Mission Control runs as three systemd services:

| Service | Description | Port(s) |
|---------|-------------|---------|
| `mc-sync` | Automerge sync server (HTTP API + WebSocket) | 8004 (HTTP), 8005 (WS) |
| `mc-daemon` | Notification daemon (delivers @mentions via OpenClaw) | - |
| `openclaw-gateway` | OpenClaw Telegram bot | - |

## Access URLs

- **UI**: https://garyc.exe.xyz/mc/
- **API**: https://garyc.exe.xyz/mc-api/
- **WebSocket**: wss://garyc.exe.xyz/mc-ws (proxied through nginx)

## Issues Fixed (2026-04-01)

### 1. OpenClaw Gateway Not Restarting After Self-Update

**Problem**: OpenClaw gateway exits cleanly (status 0) when doing a self-restart for updates. The systemd unit had `Restart=on-failure`, which doesn't trigger on clean exits.

**Fix**: Changed to `Restart=always` in `/etc/systemd/system/openclaw-gateway.service`.

### 2. Mission Control Services Not Running via Systemd

**Problem**: Services were either not running or started manually without persistence.

**Fix**: Created systemd units for `mc-sync` and `mc-daemon` with proper dependencies.

### 3. Daemon Couldn't Find OpenClaw Binary

**Problem**: The `mc-daemon` service couldn't execute `openclaw` commands because the npm global bin wasn't in PATH.

**Fix**: Added `Environment=PATH=/home/exedev/.npm-global/bin:/usr/local/bin:/usr/bin:/bin` to the daemon service.

### 4. WebSocket Connection Failing from exe.xyz

**Problem**: The sync server rejected WebSocket connections from `https://garyc.exe.xyz` due to origin validation.

**Fix**: Added exe.xyz origins to `MC_ALLOWED_ORIGINS` in the mc-sync service.

## Systemd Unit Files

### /etc/systemd/system/openclaw-gateway.service

```ini
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=exedev
Group=exedev
WorkingDirectory=/home/exedev
Environment=HOME=/home/exedev
Environment=PATH=/home/exedev/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/home/exedev/.npm-global/bin/openclaw gateway --verbose
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### /etc/systemd/system/mc-sync.service

```ini
[Unit]
Description=Mission Control Sync Server
After=network.target

[Service]
Type=simple
User=exedev
Group=exedev
WorkingDirectory=/home/exedev/clawd/mission-control
Environment=HOME=/home/exedev
Environment=NODE_ENV=production
Environment=MC_STORAGE_PATH=/home/exedev/clawd/mission-control
Environment=MC_ALLOW_INSECURE_LOCAL=1
Environment=MC_BIND_HOST=0.0.0.0
Environment=MC_ALLOWED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174,http://localhost:8004,http://127.0.0.1:8004,http://localhost:8000,https://garyc.exe.xyz,https://garyc.exe.xyz:8000
ExecStart=/usr/bin/node /home/exedev/clawd/mission-control/automerge-sync-server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### /etc/systemd/system/mc-daemon.service

```ini
[Unit]
Description=Mission Control Notification Daemon
After=network.target mc-sync.service
Requires=mc-sync.service

[Service]
Type=simple
User=exedev
Group=exedev
WorkingDirectory=/home/exedev/clawd/mission-control
Environment=HOME=/home/exedev
Environment=PATH=/home/exedev/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
Environment=MC_SYNC_SERVER=http://localhost:8004
ExecStart=/usr/bin/node /home/exedev/clawd/mission-control/daemon/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Nginx Configuration

The nginx config at `/etc/nginx/sites-enabled/default` includes:

```nginx
# Mission Control UI (static build)
location /mc/ {
    alias /home/exedev/clawd/mission-control/ui-prototype/dist/;
    index index.html;
    try_files $uri $uri/ /mc/index.html;
}

# Mission Control Sync API
location /mc-api/ {
    proxy_pass http://127.0.0.1:8004/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Mission Control WebSocket sync
location /mc-ws {
    proxy_pass http://127.0.0.1:8005;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400;
}
```

## Management Commands

```bash
# Check status
systemctl status mc-sync mc-daemon openclaw-gateway

# View logs
journalctl -u mc-sync -f
journalctl -u mc-daemon -f
journalctl -u openclaw-gateway -f

# Restart services
sudo systemctl restart mc-sync
sudo systemctl restart mc-daemon
sudo systemctl restart openclaw-gateway

# After editing unit files
sudo systemctl daemon-reload
```

## Preventing Future Issues

1. **Always use `Restart=always`** for services that do self-restarts (like OpenClaw)
2. **Include full PATH** in services that call npm-installed binaries
3. **Add external origins** to `MC_ALLOWED_ORIGINS` when deploying behind a proxy
4. **Use nginx to proxy WebSocket** connections since exe.dev additional ports may not support WS upgrades
