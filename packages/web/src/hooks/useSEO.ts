import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'https://npvm.zeabur.app';

interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
}

export function useSEO() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const pageMeta = getPageMeta(location.pathname, t);
    updateMeta(pageMeta, location.pathname, i18n.language);
  }, [location.pathname, t, i18n.language]);
}

function getPageMeta(pathname: string, t: (key: string) => string): PageMeta {
  const baseKeywords = 'npm, yarn, pnpm, bun, node.js, package manager';

  switch (pathname) {
    case '/':
      return {
        title: `${t('nav.dashboard')} - npvm`,
        description: t('docs.description'),
        keywords: `${baseKeywords}, dashboard, overview`,
      };
    case '/packages':
      return {
        title: `${t('nav.packages')} - npvm`,
        description: 'Manage installed packages. Install, uninstall, and update npm packages with real-time progress.',
        keywords: `${baseKeywords}, install, uninstall, update`,
      };
    case '/dependencies':
      return {
        title: `${t('nav.dependencies')} - npvm`,
        description: 'Visualize your dependency tree hierarchy. Detect circular dependencies and nested packages.',
        keywords: `${baseKeywords}, dependency tree, circular dependency`,
      };
    case '/security':
      return {
        title: `${t('nav.security')} - npvm`,
        description: 'Scan your dependencies for security vulnerabilities. Export audit reports in JSON, CSV, or HTML.',
        keywords: `${baseKeywords}, security audit, vulnerability, CVE`,
      };
    case '/remote':
      return {
        title: `${t('nav.remote')} - npvm`,
        description: 'Analyze GitHub/GitLab repositories without cloning. Check dependencies and security issues remotely.',
        keywords: `${baseKeywords}, remote analysis, github, gitlab`,
      };
    case '/guide':
      return {
        title: `${t('nav.docs')} - npvm`,
        description: 'Documentation and user guide for npvm. Learn how to use the package manager visual platform.',
        keywords: `${baseKeywords}, documentation, guide, tutorial`,
      };
    case '/changelog':
      return {
        title: `${t('nav.changelog')} - npvm`,
        description: 'npvm changelog and release history. See what\'s new in each version.',
        keywords: `${baseKeywords}, changelog, release, version`,
      };
    case '/settings':
      return {
        title: `${t('nav.settings')} - npvm`,
        description: 'Configure npvm settings. Change theme, language, registry, and more.',
        keywords: `${baseKeywords}, settings, configuration, theme`,
      };
    default:
      return {
        title: 'npvm - Node Package Manager Visual Platform',
        description: 'A modern visual platform for managing Node.js packages.',
        keywords: baseKeywords,
      };
  }
}

function updateMeta(meta: PageMeta, pathname: string, lang: string) {
  // Update title
  document.title = meta.title;

  // Update meta description
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', meta.description);
  }

  // Update meta keywords
  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (keywordsMeta && meta.keywords) {
    keywordsMeta.setAttribute('content', meta.keywords);
  }

  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', `${BASE_URL}${pathname}`);
  }

  // Update Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', meta.title);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', meta.description);
  }

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', `${BASE_URL}${pathname}`);
  }

  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute('content', lang === 'zh' ? 'zh_CN' : 'en_US');
  }

  // Update Twitter
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', meta.title);
  }

  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', meta.description);
  }

  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrl) {
    twitterUrl.setAttribute('content', `${BASE_URL}${pathname}`);
  }

  // Update html lang attribute
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}
