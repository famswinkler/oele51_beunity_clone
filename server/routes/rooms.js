import express from 'express';
import { query, queryOne } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all room reservations for a date range
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { roomType, startDate, endDate } = req.query;

    if (!roomType || !startDate || !endDate) {
      return res.status(400).json({ error: 'roomType, startDate und endDate erforderlich' });
    }

    const reservations = await query(
      `SELECT r.*, u.username, u.full_name
       FROM room_reservations r
       JOIN users u ON r.user_id = u.id
       WHERE r.room_type = $1
       AND r.start_time >= $2
       AND r.end_time <= $3
       ORDER BY r.start_time ASC`,
      [roomType, startDate, endDate]
    );

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Reservierungen konnten nicht abgerufen werden' });
  }
});

// Get user's reservations
router.get('/my-reservations', authMiddleware, async (req, res) => {
  try {
    const reservations = await query(
      `SELECT r.*
       FROM room_reservations r
       WHERE r.user_id = $1
       ORDER BY r.start_time DESC`,
      [req.userId]
    );

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Reservierungen konnten nicht abgerufen werden' });
  }
});

// Create reservation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomType, startTime, endTime, notes } = req.body;

    if (!roomType || !startTime || !endTime) {
      return res.status(400).json({ error: 'Alle Felder erforderlich' });
    }

    // Check for overlapping reservations
    const conflictingReservation = await queryOne(
      `SELECT id FROM room_reservations
       WHERE room_type = $1
       AND (
         (start_time < $3 AND end_time > $2) OR
         (start_time = $2)
       )`,
      [roomType, startTime, endTime]
    );

    if (conflictingReservation) {
      return res.status(409).json({ error: 'Zeitslot ist bereits reserviert' });
    }

    const reservation = await queryOne(
      `INSERT INTO room_reservations (room_type, user_id, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [roomType, req.userId, startTime, endTime, notes]
    );

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Reservierung konnte nicht erstellt werden' });
  }
});

// Update reservation
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, notes } = req.body;

    // Check ownership
    const reservation = await queryOne(
      'SELECT user_id FROM room_reservations WHERE id = $1',
      [id]
    );

    if (!reservation || reservation.user_id !== req.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }

    const updated = await queryOne(
      `UPDATE room_reservations
       SET start_time = $2, end_time = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, startTime, endTime, notes]
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Reservierung konnte nicht aktualisiert werden' });
  }
});

// Delete reservation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const reservation = await queryOne(
      'SELECT user_id FROM room_reservations WHERE id = $1',
      [id]
    );

    if (!reservation || reservation.user_id !== req.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }

    await query('DELETE FROM room_reservations WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Reservierung konnte nicht gelöscht werden' });
  }
});

export default router;
