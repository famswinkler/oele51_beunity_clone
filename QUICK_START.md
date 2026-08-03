# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Git

### 1. Install & Setup (2 minutes)
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Create PostgreSQL database
createdb reservation_app

# Initialize database schema
psql -U postgres -d reservation_app -f server/models/db/schema.sql
```

### 2. Start the App (1 minute)
**Terminal 1 - Frontend:**
```bash
npm run dev
```
Opens http://localhost:5173

**Terminal 2 - Backend:**
```bash
npm run server:dev
```
Runs http://localhost:3001

### 3. Test it (2 minutes)
1. Go to http://localhost:5173
2. Click "Registrieren" (Register)
3. Fill in form:
   - **Benutzername**: `testuser`
   - **E-Mail**: `test@example.com`
   - **Passwort**: `Test123!`
   - **Vollständiger Name**: `Test User`
   - **Etage**: `1`
4. Click "Konto erstellen"
5. You're logged in! ✅

### 4. Try Features
- **Room booking**: Click "Zimmerreservierungen" 
  - Select room (Gästezimmer or Gemeinschaftsraum)
  - Pick date and time
  - Click "Jetzt buchen"
  
- **Washing machine**: Click "Waschmaschinen"
  - Select floor (1-4)
  - Pick time slot
  - Click "Zeitslot buchen"

---

## 📁 Key Files to Know

### Frontend
| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app & routing |
| `src/pages/LoginPage.tsx` | Login screen |
| `src/pages/DashboardPage.tsx` | Home dashboard |
| `src/pages/RoomsPage.tsx` | Room booking |
| `src/pages/WashingPage.tsx` | Washing machine booking |
| `src/i18n/de-CH.json` | All text strings (German) |

### Backend
| File | Purpose |
|------|---------|
| `server/index.js` | Express app entry |
| `server/routes/auth.js` | Login/register API |
| `server/routes/rooms.js` | Room booking API |
| `server/routes/washing.js` | Washing machine API |
| `server/models/db/schema.sql` | Database tables |

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start frontend dev server
npm run server:dev      # Start backend with auto-reload
npm run build           # Build for production
npm run preview         # Preview production build

# Type checking
npm run type-check      # Check TypeScript types

# Database
psql -d reservation_app # Connect to database
\dt                     # List tables
\d room_reservations    # Describe table
```

---

## 🔑 Default User Credentials (for testing)
```
Username: testuser
Password: Test123!
```

Create your own account instead - use "Registrieren" button.

---

## 🌐 API Examples

### Register
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "Pass123!",
    "fullName": "John Doe",
    "floor": 2
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "Pass123!"
  }'
```

### Book a Room
```bash
curl -X POST http://localhost:3001/rooms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomType": "Gästezimmer",
    "startTime": "2024-01-15T14:00:00Z",
    "endTime": "2024-01-15T16:00:00Z",
    "notes": "Birthday party"
  }'
```

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      senior: {
        light: '#YourColor',    // Background
        dark: '#YourColor',     // Text
        accent: '#YourColor',   // Primary button
        // ...
      }
    }
  }
}
```

### Change Text (German/Swiss)
Edit `src/i18n/de-CH.json` - all UI strings in one file.

### Change Font Size
Edit `tailwind.config.js` in the `fontSize` section:
```javascript
fontSize: {
  'base': ['20px', '28px'],  // Increase from 18px
  'lg': ['24px', '32px'],
  // ...
}
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Check DB credentials in `.env`
- Run: `psql -U postgres -d reservation_app`

### "Port 3001/5173 already in use"
- Kill existing process: `lsof -i :3001` then `kill -9 <PID>`
- Or change port in `.env` or `vite.config.ts`

### "Token expired" error
- Clear `localStorage` in browser console
- Log in again

### Passwords don't match on register
- Must be exact match + min 6 characters
- Check for extra spaces

### Date doesn't work as expected
- Dates are formatted as DD.MM.YYYY in Swiss format
- Times are 24-hour format (HH:MM)

---

## 📚 Next Steps

1. **Test the app** - Try all features
2. **Read IMPLEMENTATION_SUMMARY.md** - Understand architecture
3. **Explore the code** - See how components work together
4. **Set up database** - Configure PostgreSQL for production
5. **Add Google Calendar** - Implement Phase 5 (see plan)

---

## 💡 Tips for Success

✅ **Always run both servers** - Frontend AND backend are needed
✅ **Check browser console** - Errors show there (F12)
✅ **Check server terminal** - API errors log there
✅ **Create test accounts** - Don't use the example one
✅ **Test on mobile** - Great responsive design
✅ **Check accessibility** - Try Tab key navigation

---

## 🎓 Learning Path

**Day 1**: Get it running → Explore UI → Read README
**Day 2**: Create accounts → Test bookings → Check database
**Day 3**: Read code → Understand flow → Plan modifications
**Day 4**: Customize → Add features → Deploy

---

## 📞 Help

- **Questions?** Check `README.md` or `IMPLEMENTATION_SUMMARY.md`
- **Bug?** Check browser console (F12) or server terminal
- **Feature?** Check planned features in `README.md` roadmap

---

**Made for seniors. Works for everyone. 🎯**
