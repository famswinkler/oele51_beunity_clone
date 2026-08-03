# Senior-Friendly Reservation App (ÖELE 51)

A simplified, accessibility-focused reservation management application for shared housing communities, designed with seniors in mind.

## Features

- **Room Reservations**: Book Gästezimmer (guest room) and Gemeinschaftsraum (common room)
- **Washing Machine Slots**: Reserve 30-minute washing machine slots on all 4 floors
- **User-Friendly Interface**: Large fonts, high contrast, minimal navigation
- **Google Calendar Integration**: Auto-sync reservations to Google Workspace calendars
- **Authentication**: Simple username/password login
- **Swiss German**: Full UI in Swiss German (de-CH) with correct spelling and grammar

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- Zustand (state management)
- Date-fns (date handling)

**Backend:**
- Node.js + Express
- PostgreSQL (database)
- JWT authentication
- Google Calendar API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd oele51_beunity_clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database and Google API credentials.

4. Initialize the database:
```bash
psql -U postgres -d reservation_app -f server/models/db/schema.sql
```

### Running the Application

**Development mode** (runs both frontend and backend):

```bash
# Terminal 1 - Frontend (Vite dev server)
npm run dev

# Terminal 2 - Backend (Node server)
npm run server:dev
```

Frontend will be available at `http://localhost:5173`
Backend API will run on `http://localhost:3001`

**Production build:**
```bash
npm run build
npm start
```

## Project Structure

```
src/
  components/          # Reusable UI components
    common/           # Button, Card, Modal, Header
    rooms/            # Room-specific components
    washing/          # Washing machine components
  pages/              # Full page components
  hooks/              # React hooks (useAuth, useReservations, etc.)
  utils/              # Utilities (API client, date formatting, i18n)
  i18n/               # Translations (German/Swiss)
  styles/             # Global styles & Tailwind config

server/
  routes/             # API endpoints (auth, rooms, washing)
  middleware/         # Authentication & error handling
  services/           # Business logic
  models/             # Database schemas
  config/             # Configuration files
```

## Key Features Implemented

### Phase 1: ✅ Project Setup
- React + Vite configuration
- TypeScript setup
- TailwindCSS with senior-friendly customizations
- Backend Express server
- PostgreSQL schema

### Phase 2: ✅ Authentication
- User registration with floor selection
- Username/password login
- JWT token management
- Protected routes

### Phase 3: ✅ Room Reservations
- Room selection (Gästezimmer / Gemeinschaftsraum)
- Date and time selection
- Booking conflicts prevention
- User's reservation management
- Edit/delete functionality

### Phase 4: ✅ Washing Machine System
- 4-floor washing machine calendar
- 30-minute slot selection
- Conflict detection
- User slot management

### Phase 5: ⏳ Google Calendar Integration
- Setup OAuth flow
- Auto-sync room reservations
- Auto-sync washing slots
- Bi-directional sync (planned)

### Phase 6: ✅ Senior-Friendly UI
- Large fonts (18px+ base, 24px+ headers)
- High contrast design
- Simplified navigation
- Clear confirmation dialogs
- Touch-friendly buttons
- Reduced motion support

### Phase 7: ⏳ Testing & Deployment
- Unit tests (planned)
- Integration tests (planned)
- E2E tests (planned)
- Docker containerization (planned)

## Accessibility Features

- **Large Typography**: Minimum 16px for body text, 24px+ for headers
- **High Contrast**: Dark text on light backgrounds
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear focus rings on all interactive elements
- **ARIA Labels**: Semantic HTML with ARIA attributes
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Color-Blind Safe**: Doesn't rely solely on color to convey meaning

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Rooms
- `GET /rooms` - Get room reservations for date range
- `POST /rooms` - Create new reservation
- `PUT /rooms/:id` - Update reservation
- `DELETE /rooms/:id` - Delete reservation
- `GET /rooms/my-reservations` - Get user's reservations

### Washing Machine
- `GET /washing` - Get washing slots for floor and date range
- `POST /washing` - Create new slot
- `PUT /washing/:id` - Update slot
- `DELETE /washing/:id` - Delete slot
- `GET /washing/my-slots` - Get user's slots

## Environment Variables

```
VITE_API_URL=http://localhost:3001/api
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reservation_app
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALENDAR_API_KEY=your_calendar_api_key
```

## Testing

Currently in development. Run tests with:
```bash
npm test
```

## Deployment

Build the application:
```bash
npm run build
```

The output will be in the `dist/` directory. Deploy to your preferred hosting platform.

For Docker deployment:
```bash
docker build -t reservation-app .
docker run -p 3001:3001 -e DB_HOST=<your-db-host> reservation-app
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on the repository or contact the development team.

## Roadmap

- [ ] Google Calendar bi-directional sync
- [ ] Email notifications for bookings
- [ ] Admin panel for managing users and slots
- [ ] Mobile app (React Native)
- [ ] Accessibility audit (WCAG 2.1 AAA)
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] User preferences storage