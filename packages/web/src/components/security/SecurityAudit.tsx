import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Play,
  Wrench,
  Download,
  Search,
  ChevronDown,
  FileJson,
  FileText,
  FileCode,
  Clock,
  Package,
  History,
  Trash2,
  X,
} from 'lucide-react';
import { useSecurityAudit, useAuditFix } from '../../hooks/usePackages';
import { useAppStore } from '../../stores/app';
import { Card, Button, EmptyState, Select } from '../ui';
import { PackageDetailModal } from '../packages/PackageDetailModal';
import type { AuditReport, VulnerabilityInfo } from '@dext7r/npvm-shared';
import { clsx } from 'clsx';

type Severity = 'critical' | 'high' | 'moderate' | 'low';
type SeverityFilter = Severity | 'all';

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-l-red-500' },
  high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-l-orange-500' },
  moderate: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-l-yellow-500' },
  low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-l-blue-500' },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function exportToJson(report: AuditReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToCsv(report: AuditReport): void {
  const headers = ['ID', 'Severity', 'Package', 'Version', 'Title', 'Recommendation', 'URL'];
  const rows = report.result.vulnerabilities.map((v) => [
    v.id,
    v.severity,
    v.package,
    v.version,
    `"${v.title.replace(/"/g, '""')}"`,
    `"${v.recommendation.replace(/"/g, '""')}"`,
    v.url || '',
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-report-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToHtml(report: AuditReport, t: (key: string) => string): void {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${t('security.reportTitle')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #1f2937; }
    .meta { background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .meta p { margin: 4px 0; color: #4b5563; }
    .summary { display: flex; gap: 16px; margin-bottom: 20px; }
    .summary-card { flex: 1; padding: 16px; border-radius: 8px; text-align: center; }
    .critical { background: #fee2e2; color: #dc2626; }
    .high { background: #ffedd5; color: #ea580c; }
    .moderate { background: #fef3c7; color: #ca8a04; }
    .low { background: #dbeafe; color: #2563eb; }
    .vuln { border-left: 4px solid; padding: 12px; margin-bottom: 12px; border-radius: 4px; }
    .vuln.critical { border-color: #dc2626; background: #fef2f2; }
    .vuln.high { border-color: #ea580c; background: #fff7ed; }
    .vuln.moderate { border-color: #ca8a04; background: #fefce8; }
    .vuln.low { border-color: #2563eb; background: #eff6ff; }
    .vuln h3 { margin: 0 0 8px; }
    .vuln p { margin: 4px 0; color: #4b5563; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${t('security.reportTitle')}</h1>
  <div class="meta">
    <p><strong>${t('security.projectPath')}:</strong> ${report.metadata.projectPath}</p>
    <p><strong>${t('security.packageManager')}:</strong> ${report.metadata.packageManager}</p>
    <p><strong>${t('security.scanTime')}:</strong> ${formatDate(report.metadata.scannedAt)}</p>
    <p><strong>${t('security.duration')}:</strong> ${formatDuration(report.metadata.duration)}</p>
  </div>
  <div class="summary">
    <div class="summary-card critical"><div style="font-size:24px;font-weight:bold">${report.result.summary.critical}</div><div>Critical</div></div>
    <div class="summary-card high"><div style="font-size:24px;font-weight:bold">${report.result.summary.high}</div><div>High</div></div>
    <div class="summary-card moderate"><div style="font-size:24px;font-weight:bold">${report.result.summary.moderate}</div><div>Moderate</div></div>
    <div class="summary-card low"><div style="font-size:24px;font-weight:bold">${report.result.summary.low}</div><div>Low</div></div>
  </div>
  <h2>${t('security.totalVulnerabilities')}: ${report.result.vulnerabilities.length}</h2>
  ${report.result.vulnerabilities.map((v) => `
  <div class="vuln ${v.severity}">
    <h3>${v.title}</h3>
    <p><strong>Package:</strong> <code>${v.package}@${v.version}</code></p>
    <p><strong>Severity:</strong> ${v.severity}</p>
    <p><strong>Recommendation:</strong> ${v.recommendation}</p>
    ${v.url ? `<p><a href="${v.url}" target="_blank">More info →</a></p>` : ''}
  </div>
  `).join('')}
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-report-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function SecurityAudit() {
  const { t } = useTranslation();
  const { lastAuditReport, auditHistory, loadAuditFromHistory, removeAuditHistory, clearAuditHistory } = useAppStore();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; version: string } | null>(null);

  const auditMutation = useSecurityAudit();
  const fixMutation = useAuditFix();

  const report = lastAuditReport;
  const result = report?.result;

  const handleAudit = async () => {
    await auditMutation.mutateAsync();
  };

  const handleFix = async () => {
    await fixMutation.mutateAsync();
  };

  const filteredVulnerabilities = useMemo(() => {
    if (!result) return [];
    let vulns = result.vulnerabilities;
    if (severityFilter !== 'all') {
      vulns = vulns.filter((v) => v.severity === severityFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      vulns = vulns.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.package.toLowerCase().includes(query) ||
          v.id.toLowerCase().includes(query)
      );
    }
    return vulns;
  }, [result, severityFilter, searchQuery]);

  const handleSeverityCardClick = (severity: Severity) => {
    setSeverityFilter((prev) => (prev === severity ? 'all' : severity));
  };

  const severityOptions = [
    { value: 'all', label: t('security.filterAll') },
    { value: 'critical', label: t('security.critical') },
    { value: 'high', label: t('security.high') },
    { value: 'moderate', label: t('security.moderate') },
    { value: 'low', label: t('security.low') },
  ];

  const isWorking = auditMutation.isPending || fixMutation.isPending;
  const hasVulnerabilities = result && result.vulnerabilities.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {t('security.title')}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 历史记录按钮 */}
          <Button
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
            leftIcon={<History size={18} />}
            className={clsx(showHistory && 'bg-gray-100 dark:bg-gray-700')}
          >
            {t('security.history')} {auditHistory.length > 0 && `(${auditHistory.length})`}
          </Button>

          <Button
            onClick={handleAudit}
            loading={auditMutation.isPending}
            leftIcon={<Play size={18} />}
          >
            {auditMutation.isPending ? t('security.scanning') : t('security.runAudit')}
          </Button>
          {hasVulnerabilities && (
            <Button
              variant="outline"
              onClick={handleFix}
              loading={fixMutation.isPending}
              leftIcon={<Wrench size={18} />}
            >
              {fixMutation.isPending ? t('security.fixing') : t('security.fixAll')}
            </Button>
          )}
          {report && (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowExportMenu(!showExportMenu)}
                rightIcon={<ChevronDown size={16} />}
                leftIcon={<Download size={18} />}
              >
                {t('security.export')}
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={() => { exportToJson(report); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileJson size={16} /> {t('security.exportJson')}
                  </button>
                  <button
                    onClick={() => { exportToCsv(report); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileText size={16} /> {t('security.exportCsv')}
                  </button>
                  <button
                    onClick={() => { exportToHtml(report, t); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileCode size={16} /> {t('security.exportHtml')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 历史记录面板 */}
      {showHistory && (
        <Card className="border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <History size={18} />
              {t('security.history')}
            </h3>
            {auditHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAuditHistory}
                leftIcon={<Trash2 size={14} />}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t('security.clearHistory')}
              </Button>
            )}
          </div>
          {auditHistory.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {auditHistory.map((item) => {
                const summary = item.report.result.summary;
                const totalVulns = summary.critical + summary.high + summary.moderate + summary.low;
                const isActive = lastAuditReport?.metadata.scannedAt === item.report.metadata.scannedAt;
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      'group flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                      isActive
                        ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    )}
                    onClick={() => loadAuditFromHistory(item.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1" title={item.projectPath}>
                        {item.projectPath}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {summary.critical > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-600">
                          {summary.critical} {t('security.critical')}
                        </span>
                      )}
                      {summary.high > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                          {summary.high} {t('security.high')}
                        </span>
                      )}
                      {totalVulns === 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-600">
                          {t('security.noVulnerabilities')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAuditHistory(item.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              {t('security.noHistory')}
            </div>
          )}
        </Card>
      )}

      {/* Metadata */}
      {report && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {t('security.lastScan')}: {formatDate(report.metadata.scannedAt)}
          </span>
          <span>|</span>
          <span>{t('security.duration')}: {formatDuration(report.metadata.duration)}</span>
          <span>|</span>
          <span className="flex items-center gap-1">
            <Package size={14} />
            {report.metadata.totalPackages} {t('security.packagesScanned')}
          </span>
        </div>
      )}

      {/* Summary Cards */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['critical', 'high', 'moderate', 'low'] as const).map((severity) => {
            const config = severityConfig[severity];
            const count = result.summary[severity];
            const isActive = severityFilter === severity;
            return (
              <Card
                key={severity}
                className={clsx(
                  'text-center transition-all cursor-pointer',
                  count > 0 ? config.bg : '',
                  isActive && 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
                )}
                onClick={() => handleSeverityCardClick(severity)}
              >
                <div className={clsx('text-3xl font-bold', count > 0 ? config.color : 'text-gray-400')}>
                  {count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t(`security.${severity}`)}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters */}
      {result && result.vulnerabilities.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('security.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <Select
            value={severityFilter}
            onChange={(val) => setSeverityFilter(val as SeverityFilter)}
            options={severityOptions}
            className="w-full sm:w-40"
          />
        </div>
      )}

      {/* Vulnerability List */}
      {result && (
        <>
          {filteredVulnerabilities.length > 0 ? (
            <div className="space-y-3">
              {filteredVulnerabilities.map((vuln: VulnerabilityInfo) => {
                const config = severityConfig[vuln.severity];
                const Icon = config.icon;
                return (
                  <Card
                    key={`${vuln.id}-${vuln.package}`}
                    padding="sm"
                    className={clsx('border-l-4', config.bg, config.border)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={20} className={config.color} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {vuln.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Package:{' '}
                          <span
                            className="font-mono text-primary-500 hover:underline cursor-pointer"
                            onClick={() => setSelectedPackage({ name: vuln.package, version: vuln.version })}
                          >
                            {vuln.package}
                          </span>{' '}
                          ({vuln.version})
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {vuln.recommendation}
                        </div>
                        {vuln.url && (
                          <a
                            href={vuln.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-500 hover:underline mt-1 inline-block"
                          >
                            {t('security.moreInfo')} →
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : result.vulnerabilities.length > 0 ? (
            <Card>
              <EmptyState
                icon={Search}
                title={t('security.noVulnerabilities')}
                description={searchQuery || severityFilter !== 'all' ? 'No matches for current filter' : ''}
              />
            </Card>
          ) : (
            <Card className="bg-green-50 dark:bg-green-900/20">
              <EmptyState
                icon={Shield}
                title={t('security.noVulnerabilities')}
                description={t('security.depsSecure')}
                className="py-4"
              />
            </Card>
          )}
        </>
      )}

      {/* Initial State */}
      {!result && !isWorking && (
        <Card>
          <EmptyState
            icon={Shield}
            title={t('security.clickToScan')}
          />
        </Card>
      )}

      <PackageDetailModal
        packageName={selectedPackage?.name || null}
        currentVersion={selectedPackage?.version}
        onClose={() => setSelectedPackage(null)}
      />
    </div>
  );
}
