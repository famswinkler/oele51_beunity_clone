import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { useWashingSlots } from '../hooks/useWashingSlots';
import { t } from '../utils/i18n';
import { formatDate, formatDateTime, generateTimeSlots } from '../utils/dates';

export const WashingPage: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:30');
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);

  const { createSlot, fetchSlots, error, isLoading } = useWashingSlots();

  useEffect(() => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 30);

    fetchSlots(
      selectedFloor,
      startDate.toISOString(),
      endDate.toISOString()
    );
  }, [selectedFloor, selectedDate]);

  const handleBooking = async () => {
    try {
      const [year, month, day] = selectedDate.split('.');
      const startDateTime = new Date(`${year}-${month}-${day}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${year}-${month}-${day}T${endTime}:00`).toISOString();

      await createSlot(selectedFloor, startDateTime, endDateTime, notes);
      setShowModal(false);
      setStartTime('08:00');
      setEndTime('08:30');
      setNotes('');
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const timeSlots = generateTimeSlots(8, 22, 30);

  return (
    <div className="min-h-screen bg-senior-light">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8">{t('washing.title')}</h1>

        {/* Floor Selection */}
        <Card className="mb-8">
          <h2 className="text-3xl font-bold mb-6">{t('washing.selectFloor')}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`p-6 rounded-lg border-4 text-2xl font-bold transition-all ${
                  selectedFloor === floor
                    ? 'bg-senior-success text-white border-senior-success'
                    : 'bg-white text-senior-dark border-gray-300 hover:border-senior-success'
                }`}
              >
                {floor}️⃣ Etage {floor}
              </button>
            ))}
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xl font-semibold mb-3">{t('washing.selectTime')}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(formatDate(new Date(e.target.value)))}
                className="input-field text-lg"
              />
            </div>

            <div>
              <label className="block text-xl font-semibold mb-3">{t('washing.startTime')}</label>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field text-lg">
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xl font-semibold mb-3">{t('washing.endTime')}</label>
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

          <Button onClick={() => setShowModal(true)} size="lg" className="w-full" variant="success">
            {t('washing.bookNow')}
          </Button>
        </Card>

        {/* Calendar View */}
        <Card title={t('washing.slotDetails')}>
          {slots.length > 0 ? (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div key={slot.id} className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-lg font-semibold">{slot.full_name || slot.username}</p>
                  <p className="text-base text-gray-600">{formatDateTime(slot.start_time)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xl text-gray-600">{t('washing.noSlots')}</p>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        title={t('common.confirmAction')}
        onClose={() => setShowModal(false)}
        onConfirm={handleBooking}
        confirmText={t('washing.bookNow')}
      >
        <div className="space-y-4">
          <p className="text-xl">
            <strong>{t(`washing.floor${selectedFloor}`)}</strong>
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
