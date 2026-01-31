export function getLandingPage(port: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>npvm API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      min-height: 100vh;
      color: #e2e8f0;
      overflow-x: hidden;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      text-align: center;
      padding: 4rem 0 3rem;
      position: relative;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .logo-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
    }
    h1 {
      font-size: 3rem;
      font-weight: 700;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 1.25rem;
      margin-top: 0.5rem;
    }
    .badge {
      display: inline-block;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      margin-top: 1rem;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: rgba(59, 130, 246, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .card-icon.blue { background: rgba(59, 130, 246, 0.2); }
    .card-icon.purple { background: rgba(139, 92, 246, 0.2); }
    .card-icon.green { background: rgba(34, 197, 94, 0.2); }
    .card-icon.orange { background: rgba(249, 115, 22, 0.2); }
    .card-icon.pink { background: rgba(236, 72, 153, 0.2); }
    .card-icon.cyan { background: rgba(6, 182, 212, 0.2); }
    .card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .card p {
      color: #94a3b8;
      font-size: 0.9375rem;
      line-height: 1.6;
    }
    .endpoints {
      margin-top: 3rem;
    }
    .endpoints h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .endpoint-group {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    .endpoint-group-header {
      background: rgba(59, 130, 246, 0.1);
      padding: 0.75rem 1rem;
      font-weight: 600;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .endpoint {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.05);
      transition: background 0.2s;
    }
    .endpoint:last-child { border-bottom: none; }
    .endpoint:hover { background: rgba(59, 130, 246, 0.05); }
    .method {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      min-width: 50px;
      text-align: center;
      margin-right: 1rem;
    }
    .method.get { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .method.post { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .method.put { background: rgba(249, 115, 22, 0.2); color: #f97316; }
    .method.delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: #e2e8f0;
      flex: 1;
    }
    .endpoint-desc {
      color: #64748b;
      font-size: 0.8125rem;
    }
    .cta {
      text-align: center;
      margin-top: 3rem;
      padding: 2rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      margin: 0.5rem;
    }
    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
    }
    .btn-secondary {
      background: rgba(148, 163, 184, 0.1);
      color: #e2e8f0;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }
    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.2);
    }
    footer {
      text-align: center;
      padding: 2rem;
      color: #64748b;
      font-size: 0.875rem;
    }
    footer a {
      color: #60a5fa;
      text-decoration: none;
    }
    footer a:hover { text-decoration: underline; }
    .glow {
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%);
      pointer-events: none;
    }
    .glow-1 { top: -200px; left: -200px; }
    .glow-2 { top: -200px; right: -200px; background: radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%); }
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      .cards { grid-template-columns: 1fr; }
      .endpoint { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .method { margin-right: 0; }
    }
  </style>
</head>
<body>
  <div class="glow glow-1"></div>
  <div class="glow glow-2"></div>

  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-icon">📦</div>
        <h1>npvm API</h1>
      </div>
      <p class="subtitle">Node Package Manager Visual Platform</p>
      <span class="badge">v0.1.0 • Running on port ${port}</span>
    </header>

    <div class="cards">
      <div class="card">
        <div class="card-icon blue">🔍</div>
        <h3>Package Management</h3>
        <p>Install, uninstall, and update npm packages with real-time progress tracking via SSE.</p>
      </div>
      <div class="card">
        <div class="card-icon purple">🌳</div>
        <h3>Dependency Analysis</h3>
        <p>Visualize your dependency tree and detect circular dependencies.</p>
      </div>
      <div class="card">
        <div class="card-icon green">🛡️</div>
        <h3>Security Audit</h3>
        <p>Scan for vulnerabilities in your dependencies with detailed severity reports.</p>
      </div>
      <div class="card">
        <div class="card-icon orange">🌐</div>
        <h3>Remote Analysis</h3>
        <p>Analyze GitHub/GitLab repositories without cloning - check packages, security, and updates.</p>
      </div>
      <div class="card">
        <div class="card-icon pink">📋</div>
        <h3>Registry Management</h3>
        <p>Switch between npm, Taobao, Tencent, and other registries seamlessly.</p>
      </div>
      <div class="card">
        <div class="card-icon cyan">🔧</div>
        <h3>Multi-PM Support</h3>
        <p>Works with npm, yarn, pnpm, and bun - detect and switch package managers.</p>
      </div>
    </div>

    <div class="endpoints">
      <h2>📡 API Endpoints</h2>

      <div class="endpoint-group">
        <div class="endpoint-group-header">📦 Package Manager</div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="endpoint-path">/api/pm/detect</span>
          <span class="endpoint-desc">Detect installed package managers</span>
        </div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="endpoint-path">/api/pm/current</span>
          <span class="endpoint-desc">Get current package manager</span>
        </div>
        <div class="endpoint">
          <span class="method put">PUT</span>
          <span class="endpoint-path">/api/pm/current</span>
          <span class="endpoint-desc">Set package manager</span>
        </div>
      </div>

      <div class="endpoint-group">
        <div class="endpoint-group-header">📋 Packages</div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="endpoint-path">/api/packages</span>
          <span class="endpoint-desc">List installed packages</span>
        </div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="endpoint-path">/api/packages/search?q=...</span>
          <span class="endpoint-desc">Search npm packages</span>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="endpoint-path">/api/packages/install</span>
          <span class="endpoint-desc">Install packages (SSE)</span>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="endpoint-path">/api/packages/uninstall</span>
          <span class="endpoint-desc">Uninstall packages (SSE)</span>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="endpoint-path">/api/packages/update</span>
          <span class="endpoint-desc">Update packages (SSE)</span>
        </div>
      </div>

      <div class="endpoint-group">
        <div class="endpoint-group-header">🛡️ Security & Analysis</div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="endpoint-path">/api/deps/tree</span>
          <span class="endpoint-desc">Get dependency tree</span>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="endpoint-path">/api/security/audit</span>
          <span class="endpoint-desc">Run security audit (SSE)</span>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="endpoint-path">/api/remote/analyze</span>
          <span class="endpoint-desc">Analyze remote repository</span>
        </div>
      </div>

      <div class="endpoint-group">
        <div class="endpoint-group-header">🌐 Registry</div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="endpoint-path">/api/registry/list</span>
          <span class="endpoint-desc">List available registries</span>
        </div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="endpoint-path">/api/registry/current</span>
          <span class="endpoint-desc">Get current registry</span>
        </div>
        <div class="endpoint">
          <span class="method put">PUT</span>
          <span class="endpoint-path">/api/registry/current</span>
          <span class="endpoint-desc">Set registry URL</span>
        </div>
      </div>
    </div>

    <div class="cta">
      <a href="/docs" class="btn btn-primary">
        📖 Interactive API Docs
      </a>
      <a href="https://github.com/h7ml/npvm" class="btn btn-secondary" target="_blank">
        ⭐ GitHub
      </a>
    </div>

    <footer>
      <p>Built with ❤️ by <a href="https://github.com/h7ml" target="_blank">h7ml</a></p>
      <p style="margin-top: 0.5rem;">Fastify • TypeScript • React</p>
    </footer>
  </div>
</body>
</html>`;
}
