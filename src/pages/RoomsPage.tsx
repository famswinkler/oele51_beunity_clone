import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { useReservations } from '../hooks/useReservations';
import { t } from '../utils/i18n';
import { formatDate, formatDateTime, generateTimeSlots } from '../utils/dates';

export const RoomsPage: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<'Gästezimmer' | 'Gemeinschaftsraum'>('Gästezimmer');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);

  const { createReservation, fetchReservations, error, isLoading } = useReservations();

  useEffect(() => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 30);

    fetchReservations(
      selectedRoom,
      startDate.toISOString(),
      endDate.toISOString()
    ).then(() => {
      // Fetch is handled in the hook
    });
  }, [selectedRoom, selectedDate]);

  const handleBooking = async () => {
    try {
      const [year, month, day] = selectedDate.split('.');
      const startDateTime = new Date(`${year}-${month}-${day}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${year}-${month}-${day}T${endTime}:00`).toISOString();

      await createReservation(selectedRoom, startDateTime, endDateTime, notes);
      setShowModal(false);
      setStartTime('10:00');
      setEndTime('11:00');
      setNotes('');
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const timeSlots = generateTimeSlots(8, 20, 30);

  return (
    <div className="min-h-screen bg-senior-light">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8">{t('rooms.title')}</h1>

        {/* Room Selection */}
        <Card className="mb-8">
          <h2 className="text-3xl font-bold mb-6">{t('rooms.selectRoom')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {(['Gästezimmer', 'Gemeinschaftsraum'] as const).map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`p-6 rounded-lg border-4 text-2xl font-bold transition-all ${
                  selectedRoom === room
                    ? 'bg-senior-accent text-white border-senior-accent'
                    : 'bg-white text-senior-dark border-gray-300 hover:border-senior-accent'
                }`}
              >
                {room === 'Gästezimmer' ? '🛏️' : '🪑'} {t(`rooms.${room === 'Gästezimmer' ? 'guestRoom' : 'commonRoom'}`)}
              </button>
            ))}
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xl font-semibold mb-3">{t('rooms.selectDate')}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(formatDate(new Date(e.target.value)))}
                className="input-field text-lg"
              />
            </div>

            <div>
              <label className="block text-xl font-semibold mb-3">{t('rooms.startTime')}</label>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field text-lg">
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xl font-semibold mb-3">{t('rooms.endTime')}</label>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input-field text-lg">
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xl font-semibold mb-3">{t('common.addNote')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-senior-accent"
              rows={3}
              placeholder="Optionale Notiz..."
            />
          </div>

          <Button onClick={() => setShowModal(true)} size="lg" className="w-full">
            {t('rooms.bookNow')}
          </Button>
        </Card>

        {/* Calendar View */}
        <Card title={t('rooms.reservationDetails')}>
          {reservations.length > 0 ? (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div key={res.id} className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-lg font-semibold">{res.full_name || res.username}</p>
                  <p className="text-base text-gray-600">{formatDateTime(res.start_time)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xl text-gray-600">{t('rooms.noReservations')}</p>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        title={t('common.confirmAction')}
        onClose={() => setShowModal(false)}
        onConfirm={handleBooking}
        confirmText={t('rooms.bookNow')}
      >
        <div className="space-y-4">
          <p className="text-xl">
            <strong>{selectedRoom}</strong>
          </p>
          <p className="text-lg">{formatDate(selectedDate)}</p>
          <p className="text-lg">
            {startTime} - {endTime}
          </p>
          {notes && <p className="text-lg text-gray-600">Notiz: {notes}</p>}
        </div>
      </Modal>
    </div>
  );
};
