import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../hooks/useAuth';
import { useReservations } from '../hooks/useReservations';
import { useWashingSlots } from '../hooks/useWashingSlots';
import { t } from '../utils/i18n';
import { formatDateTime } from '../utils/dates';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { userReservations, fetchUserReservations } = useReservations();
  const { userSlots, fetchUserSlots } = useWashingSlots();

  useEffect(() => {
    fetchUserReservations();
    fetchUserSlots();
  }, []);

  const upcomingReservations = userReservations.slice(0, 3);
  const upcomingSlots = userSlots.slice(0, 3);

  return (
    <div className="min-h-screen bg-senior-light">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <h2 className="text-4xl font-bold mb-2">
            {t('dashboard.welcomeMessage')}, {user?.full_name || user?.username}! 👋
          </h2>
          <p className="text-2xl text-gray-600 mb-6">{t('app.tagline')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/rooms" className="block">
              <Button className="w-full" size="lg">
                🏠 {t('dashboard.bookRoom')}
              </Button>
            </Link>
            <Link to="/washing" className="block">
              <Button className="w-full" size="lg">
                🧺 {t('dashboard.bookWashing')}
              </Button>
            </Link>
            <Link to="/my-reservations" className="block">
              <Button variant="secondary" className="w-full" size="lg">
                📋 {t('dashboard.viewMyReservations')}
              </Button>
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Reservations */}
          <Card title={t('dashboard.upcomingReservations')}>
            {upcomingReservations.length > 0 ? (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                    <p className="text-xl font-semibold">{reservation.room_type}</p>
                    <p className="text-lg text-gray-600">{formatDateTime(reservation.start_time)}</p>
                    {reservation.notes && <p className="text-lg mt-2">{reservation.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xl text-gray-600">{t('rooms.noReservations')}</p>
            )}
          </Card>

          {/* Upcoming Washing Slots */}
          <Card title={t('dashboard.upcomingSlots')}>
            {upcomingSlots.length > 0 ? (
              <div className="space-y-4">
                {upcomingSlots.map((slot) => (
                  <div key={slot.id} className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                    <p className="text-xl font-semibold">
                      {t(`washing.${`floor${slot.floor}` as any}`)}
                    </p>
                    <p className="text-lg text-gray-600">{formatDateTime(slot.start_time)}</p>
                    {slot.notes && <p className="text-lg mt-2">{slot.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xl text-gray-600">{t('washing.noSlots')}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
