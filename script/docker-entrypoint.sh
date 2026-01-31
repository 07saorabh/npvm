#!/bin/sh
set -e

echo "Starting NPVM server..."

# 启动服务器（后台运行）
node packages/server/dist/index.js &
SERVER_PID=$!

# 等待服务器启动
echo "Waiting for server to be ready..."
for i in $(seq 1 30); do
  if wget --spider --quiet http://localhost:3456/api/pm/detect 2>/dev/null; then
    echo "Server is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Server failed to start within 30 seconds"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# 运行测试包安装脚本（如果存在且启用）
if [ "${RUN_INSTALL_TEST:-false}" = "true" ] && [ -f "script/api_install.js" ]; then
  echo "Running package installation test..."
  node script/api_install.js || echo "Installation test failed, but continuing..."
fi

# 等待服务器进程
wait $SERVER_PID
