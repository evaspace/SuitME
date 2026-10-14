#!/bin/bash
rm -rf ~/.cache/* ~/.bun/install/cache ~/.npm
find ~ -type d -name "node_modules" -prune -exec rm -rf '{}' +
find ~ -type d -name ".next" -prune -exec rm -rf '{}' +
if command -v docker &> /dev/null; then docker system prune -af --volumes; fi
sudo journalctl --vacuum-size=50M
df -h ~
