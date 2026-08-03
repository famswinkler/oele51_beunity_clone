-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  floor INTEGER,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room reservations table
CREATE TABLE IF NOT EXISTS room_reservations (
  id SERIAL PRIMARY KEY,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('Gästezimmer', 'Gemeinschaftsraum')),
  user_id INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  google_event_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (room_type, start_time, end_time)
);

-- Washing machine slots table
CREATE TABLE IF NOT EXISTS washing_slots (
  id SERIAL PRIMARY KEY,
  floor INTEGER NOT NULL CHECK (floor >= 1 AND floor <= 4),
  user_id INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  google_event_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (floor, start_time, end_time)
);

-- Google sync log table
CREATE TABLE IF NOT EXISTS google_sync_log (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER,
  washing_slot_id INTEGER,
  reservation_type VARCHAR(50) NOT NULL CHECK (reservation_type IN ('room', 'washing')),
  google_event_id VARCHAR(255),
  sync_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES room_reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (washing_slot_id) REFERENCES washing_slots(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_room_reservations_user_id ON room_reservations(user_id);
CREATE INDEX idx_room_reservations_start_time ON room_reservations(start_time);
CREATE INDEX idx_room_reservations_room_type ON room_reservations(room_type);
CREATE INDEX idx_washing_slots_user_id ON washing_slots(user_id);
CREATE INDEX idx_washing_slots_floor ON washing_slots(floor);
CREATE INDEX idx_washing_slots_start_time ON washing_slots(start_time);
CREATE INDEX idx_google_sync_log_status ON google_sync_log(sync_status);
