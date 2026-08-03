import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { t } from '../utils/i18n';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [floor, setFloor] = useState('1');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    try {
      await register(username, email, password, fullName, parseInt(floor));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || t('errors.networkError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-senior-light to-gray-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-senior-accent">{t('auth.register')}</h1>

        {error && (
          <div className="bg-red-100 border-2 border-senior-error rounded-lg p-4 mb-6" role="alert">
            <p className="text-lg text-senior-error font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-lg font-semibold mb-2">
              {t('auth.fullName')}
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-lg font-semibold mb-2">
              {t('auth.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-lg font-semibold mb-2">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-semibold mb-2">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-lg font-semibold mb-2">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="floor" className="block text-lg font-semibold mb-2">
              {t('auth.floor')}
            </label>
            <select
              id="floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="input-field text-lg"
              disabled={isLoading}
            >
              <option value="1">Etage 1</option>
              <option value="2">Etage 2</option>
              <option value="3">Etage 3</option>
              <option value="4">Etage 4</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('common.loading') : t('auth.signUpButton')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-lg mb-4">{t('auth.alreadyHaveAccount')}</p>
          <Link to="/login" className="text-xl font-semibold text-senior-accent hover:underline">
            {t('auth.login')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
