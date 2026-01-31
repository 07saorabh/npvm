#!/bin/sh
set -e

echo "Starting npvm server..."

# 直接启动服务器（前台运行，保持容器存活）
exec node packages/server/dist/index.js
