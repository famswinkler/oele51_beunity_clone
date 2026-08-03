import express from 'express';
import { query, queryOne } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get washing machine slots for a floor and date range
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { floor, startDate, endDate } = req.query;

    if (!floor || !startDate || !endDate) {
      return res.status(400).json({ error: 'floor, startDate und endDate erforderlich' });
    }

    const slots = await query(
      `SELECT s.*, u.username, u.full_name
       FROM washing_slots s
       JOIN users u ON s.user_id = u.id
       WHERE s.floor = $1
       AND s.start_time >= $2
       AND s.end_time <= $3
       ORDER BY s.start_time ASC`,
      [floor, startDate, endDate]
    );

    res.json(slots);
  } catch (error) {
    console.error('Error fetching washing slots:', error);
    res.status(500).json({ error: 'Zeitslots konnten nicht abgerufen werden' });
  }
});

// Get user's washing slots
router.get('/my-slots', authMiddleware, async (req, res) => {
  try {
    const slots = await query(
      `SELECT s.*
       FROM washing_slots s
       WHERE s.user_id = $1
       ORDER BY s.start_time DESC`,
      [req.userId]
    );

    res.json(slots);
  } catch (error) {
    console.error('Error fetching user washing slots:', error);
    res.status(500).json({ error: 'Zeitslots konnten nicht abgerufen werden' });
  }
});

// Create washing slot
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { floor, startTime, endTime, notes } = req.body;

    if (!floor || !startTime || !endTime) {
      return res.status(400).json({ error: 'Alle Felder erforderlich' });
    }

    if (floor < 1 || floor > 4) {
      return res.status(400).json({ error: 'Etage muss zwischen 1 und 4 liegen' });
    }

    // Check for overlapping slots
    const conflictingSlot = await queryOne(
      `SELECT id FROM washing_slots
       WHERE floor = $1
       AND (
         (start_time < $3 AND end_time > $2) OR
         (start_time = $2)
       )`,
      [floor, startTime, endTime]
    );

    if (conflictingSlot) {
      return res.status(409).json({ error: 'Zeitslot ist bereits reserviert' });
    }

    const slot = await queryOne(
      `INSERT INTO washing_slots (floor, user_id, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [floor, req.userId, startTime, endTime, notes]
    );

    res.status(201).json(slot);
  } catch (error) {
    console.error('Error creating washing slot:', error);
    res.status(500).json({ error: 'Zeitslot konnte nicht erstellt werden' });
  }
});

// Update washing slot
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, notes } = req.body;

    // Check ownership
    const slot = await queryOne(
      'SELECT user_id FROM washing_slots WHERE id = $1',
      [id]
    );

    if (!slot || slot.user_id !== req.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }

    const updated = await queryOne(
      `UPDATE washing_slots
       SET start_time = $2, end_time = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, startTime, endTime, notes]
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating washing slot:', error);
    res.status(500).json({ error: 'Zeitslot konnte nicht aktualisiert werden' });
  }
});

// Delete washing slot
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const slot = await queryOne(
      'SELECT user_id FROM washing_slots WHERE id = $1',
      [id]
    );

    if (!slot || slot.user_id !== req.userId) {
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }

    await query('DELETE FROM washing_slots WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting washing slot:', error);
    res.status(500).json({ error: 'Zeitslot konnte nicht gelöscht werden' });
  }
});

export default router;
