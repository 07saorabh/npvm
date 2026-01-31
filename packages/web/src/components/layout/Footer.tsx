import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

// 部署平台演示链接
const DEMO_LINKS = [
  { name: 'Zeabur', url: 'https://npvm.zeabur.app', icon: '🚀' },
  { name: 'Vercel', url: 'https://npvm.vercel.app', icon: '▲' },
  { name: 'Cloudflare', url: 'https://npvm.pages.dev', icon: '☁️' },
  { name: 'Netlify', url: 'https://npvm.netlify.app', icon: '🌐' },
  { name: 'Deno', url: 'https://website.npvm.deno.net', icon: '🦕' },
  { name: 'Surge', url: 'https://npvm.surge.sh', icon: '⚡' },
  { name: 'Render', url: 'https://npvm.onrender.com', icon: '🎨' },
  { name: 'Railway', url: 'https://npvm.up.railway.app', icon: '🚂' },
  { name: 'Kinsta', url: 'https://npvm.kinsta.page', icon: '🔥' },
];

export function Footer() {
  const { t } = useTranslation();

  const mainLinks = [
    { href: 'https://github.com/h7ml/npvm', label: 'GitHub', icon: '⭐' },
    { href: 'https://www.npmjs.com/package/@dext7r/npvm-cli', label: 'npm', icon: '📦' },
    { href: '/docs', label: 'Swagger API', icon: '📖' },
  ];

  return (
    <footer className="mt-8 mb-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* 主要链接 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {mainLinks.map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              <span>{icon}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
              {href.startsWith('http') && <ExternalLink size={12} className="text-gray-400" />}
            </a>
          ))}
        </div>

        {/* 演示平台链接 */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t('docs.liveDemo')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DEMO_LINKS.map(({ name, url, icon }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400"
                title={`${name} Demo`}
              >
                <span>{icon}</span>
                <span>{name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          <span>{t('docs.builtWith')} </span>
          <a href="https://github.com/h7ml" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
            h7ml
          </a>
          <span className="mx-2">•</span>
          <span>MIT License © 2026</span>
        </div>
      </div>
    </footer>
  );
}
