import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

export function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* 数字 404 */}
      <div className="relative select-none mb-6">
        <span className="text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent opacity-90">
          404
        </span>
        <div className="absolute inset-0 text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter text-primary-500/5 blur-2xl">
          404
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
        {t('notFound.title')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        {t('notFound.description')}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
          {t('notFound.goBack')}
        </Button>
        <Button onClick={() => navigate('/')} leftIcon={<Home size={16} />}>
          {t('notFound.goHome')}
        </Button>
      </div>
    </div>
  );
}
