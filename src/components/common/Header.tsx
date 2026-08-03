import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { t } from '../../utils/i18n';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md border-b-4 border-senior-accent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-senior-accent">{t('app.title')}</h1>
          <p className="text-lg text-gray-600">{t('app.subtitle')}</p>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <>
              <div className="text-right">
                <p className="text-xl font-semibold">{user.full_name || user.username}</p>
                <p className="text-lg text-gray-600">Etage {user.floor}</p>
              </div>
              <Button variant="secondary" onClick={logout} size="sm">
                {t('auth.logout')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
