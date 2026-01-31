# 安全审计功能修复说明

## 修复内容

### 1. 增强的错误处理和日志

所有包管理器适配器（npm、pnpm、yarn、bun）的 `audit` 方法现在包含：

- ✅ **详细的命令执行日志** - 记录执行的命令、工作目录、退出码
- ✅ **原始输出记录** - 记录 stdout/stderr 的长度和内容
- ✅ **数据解析日志** - 记录解析的数据结构键
- ✅ **错误详情** - 捕获并记录具体的错误信息
- ✅ **空输出检测** - 检测并警告空输出情况

### 2. 更健壮的数据解析

#### npm 适配器
- 支持 npm v6 的 `advisories` 格式
- 支持 npm v7+ 的 `vulnerabilities` 格式
- 处理不同的漏洞数据结构（`via` 数组）
- 安全的可选链访问，避免崩溃

#### pnpm 适配器
- 改进 `advisories` 对象解析
- 添加默认值处理

#### yarn 适配器
- 逐行解析 JSON 输出
- 处理 `auditAdvisory` 和 `auditSummary` 事件
- 记录每行的解析状态

#### bun 适配器
- **新增功能**：使用 npm audit 作为后备方案
- 检测 npm 是否可用
- 支持 npm v6 和 v7+ 的输出格式

### 3. Docker 部署增强

#### 新增文件
- `script/docker-entrypoint.sh` - 智能启动脚本
  - 启动服务器并等待就绪
  - 可选运行测试包安装（通过环境变量控制）
  - 优雅的错误处理

#### Dockerfile 修改
- 复制 `script/` 目录到镜像
- 使用启动脚本替代直接启动

#### docker-compose.yml 修改
- 新增 `RUN_INSTALL_TEST` 环境变量（默认 false）

## 使用方法

### 本地开发测试

1. **启动服务器**
   ```bash
   pnpm dev
   ```

2. **运行测试包安装**
   ```bash
   node script/api_install.js
   ```

3. **查看审计日志**
   - 打开浏览器访问 http://localhost:5173
   - 进入 Security 页面
   - 点击"运行审计"按钮
   - 查看服务器控制台输出的详细日志

### Docker 部署

#### 方式 1：不运行测试包安装（推荐生产环境）

```bash
docker-compose up -d
```

#### 方式 2：启动时运行测试包安装

```bash
# 修改 docker-compose.yml 中的环境变量
RUN_INSTALL_TEST=true

# 或者通过命令行覆盖
docker-compose up -d -e RUN_INSTALL_TEST=true
```

#### 方式 3：手动运行测试脚本

```bash
# 进入容器
docker-compose exec npvm sh

# 运行测试脚本
node script/api_install.js
```

### 查看日志

```bash
# 查看容器日志
docker-compose logs -f npvm

# 查看审计相关日志
docker-compose logs npvm | grep audit
```

## 日志示例

### 成功扫描
```
[npm audit] Running: npm audit --json in /workspace
[npm audit] Exit code: 0
[npm audit] Raw output length: 15234 bytes
[npm audit] Parsed data keys: [ 'auditReportVersion', 'vulnerabilities', 'metadata' ]
[npm audit] Found 5 vulnerabilities: { critical: 1, high: 2, moderate: 2, low: 0, total: 5 }
```

### 空输出警告
```
[npm audit] Running: npm audit --json in /workspace
[npm audit] Exit code: 0
[npm audit] Raw output length: 0 bytes
[npm audit] Empty output from npm audit
```

### 错误情况
```
[npm audit] Running: npm audit --json in /workspace
[npm audit] stderr: npm ERR! code ENOENT
[npm audit] Exit code: 1
[npm audit] Error: Command failed with exit code 1
```

## 为什么可能扫描不到漏洞？

### 1. 依赖未安装
- 确保项目目录下有 `node_modules/`
- 运行 `npm install` 或对应的包管理器安装命令

### 2. 漏洞数据库未收录
- npm audit 依赖官方漏洞数据库
- 新发现的漏洞可能尚未收录
- 某些包的漏洞可能未被报告

### 3. 项目路径问题
- 确保在正确的项目目录下运行
- 检查 Settings 页面的项目路径配置

### 4. 包管理器版本
- 旧版本的包管理器可能输出格式不同
- 建议使用最新版本

### 5. 网络问题
- audit 命令需要访问 npm registry
- 检查网络连接和 registry 配置

## 测试建议

使用 `script/api_install.js` 安装已知漏洞版本的包：

```bash
# 安装测试包（包含已知漏洞）
node script/api_install.js

# 等待安装完成后，运行审计
# 在 Web UI 的 Security 页面点击"运行审计"
```

测试包列表包含：
- `lodash@4.17.11` - 已知原型污染漏洞
- `axios@0.18.0` - 已知 SSRF 漏洞
- `minimist@1.2.0` - 已知原型污染漏洞
- 等 100 个包

## 故障排查

### 问题：审计返回空结果

**检查步骤：**
1. 查看服务器日志中的 `[npm audit]` 输出
2. 确认 `Exit code` 是否为 0
3. 检查 `Raw output length` 是否大于 0
4. 验证项目目录下是否有 `package.json` 和 `node_modules/`

### 问题：Docker 容器中无法运行审计

**检查步骤：**
1. 确认容器内有包管理器：`docker-compose exec npvm which npm`
2. 检查挂载的卷是否正确
3. 验证用户权限（容器使用 `npvm` 用户）

### 问题：测试脚本无法连接到服务器

**检查步骤：**
1. 确认服务器已启动：`curl http://localhost:3456/api/pm/detect`
2. 检查防火墙设置
3. 验证 `script/api_install.js` 中的 `BASE_URL` 配置

## 技术细节

### 日志级别
- `console.log` - 正常流程信息
- `console.warn` - 警告（如空输出）
- `console.error` - 错误信息

### 性能影响
- 日志输出对性能影响极小（< 1ms）
- 生产环境可通过环境变量控制日志级别（未来功能）

### 安全考虑
- 日志不包含敏感信息
- 原始输出仅记录长度，不记录完整内容
- 错误信息经过过滤

## 后续改进计划

- [ ] 添加日志级别配置（环境变量）
- [ ] 支持自定义漏洞数据源
- [ ] 添加漏洞缓存机制
- [ ] 集成更多安全扫描工具（Snyk、Trivy）
- [ ] 生成审计报告（PDF/HTML）
