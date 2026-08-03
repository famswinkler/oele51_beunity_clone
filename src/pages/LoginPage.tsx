import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { t } from '../utils/i18n';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || t('errors.networkError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-senior-light to-gray-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-senior-accent">{t('app.title')}</h1>

        {error && (
          <div className="bg-red-100 border-2 border-senior-error rounded-lg p-4 mb-6" role="alert">
            <p className="text-lg text-senior-error font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-xl font-semibold mb-2">
              {t('auth.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xl font-semibold mb-2">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('common.loading') : t('auth.signInButton')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-lg mb-4">{t('auth.noAccount')}</p>
          <Link to="/register" className="text-xl font-semibold text-senior-accent hover:underline">
            {t('auth.signUpButton')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
