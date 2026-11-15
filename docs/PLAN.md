# Oele51 Hausverein app: plan

Status 15 Nov 2026: the app works end to end (server, login, reservations, admin area). It is not hosted yet.

## Goal

A small, fast app for the residents of Oele51 that replaces the current house app for four things only:

1. Reserve rooms, tables and other shared things
2. Events, linked to the room reservation
3. Reserve the washing machine on each of the 4 floors
4. An info board

Chat, marketplace, working groups and damage reports are out of scope. Chat moves to WhatsApp.

## Decided

- Admins can add, edit, pause and remove anything that can be reserved
- Reservations are flexible: from 1 hour up to the whole day. Admins set a minimum and maximum per thing
- Washing machine reservations can repeat (every week or every 2 weeks), at most 4 months in advance
- One login per flat. No limit per flat
- Login with any email address or a short name, plus an initial password from the admin that the flat can change
- The app says "Du"
- Only admins post notices and plan events. Events show first on the info board, with a picture if there is one
- The info board opens the start page
- Admin email and WhatsApp link do not exist yet. Admins enter them later in the app
- Each device can set the text size and light or dark colours. Contrast must stay readable in bright light

## Design rules (for senior residents)

- Text at least 18 px, buttons at least 56 px high, strong contrast
- Start page shows the info board and three wide buttons. Nothing is hidden behind a menu
- A bottom bar with icon and word is visible on every screen
- Reserving takes three steps: what, day, time. Then one confirmation
- Plain Swiss German words: Reservation, Anlass, Waschmaschine, Infotafel
- Status is shown in words, not colour alone: "frei", "teils", "voll", "Meine Reservation"
- Deleting always asks "Ja / Nein" first
- Colours from the logo: sage green, charcoal, the peach of the balconies. Dark mode included
- Typeface: Atkinson Hyperlegible, made for readers with low vision

## Login

- The admin creates one account per flat: a name ("Wohnung 1.06"), a login (any email address or a short name like "1.06") and an initial password. The app can suggest one that is easy to type, such as "Linde-4821"
- The flat logs in once per device and stays logged in for a year from the last use. Several devices per flat work at the same time
- After the first login the start page offers "Eigenes Passwort wählen". The flat may keep the initial password
- Forgotten password: an admin sets a new initial password. That logs the flat out on all devices
- No email is ever sent, so no mail service is needed and a login never depends on one
- Passwords are stored only as scrypt hashes. After 8 wrong tries a login is paused for 15 minutes

## How double bookings are prevented

- The browser never decides whether a time is free. It asks the server
- The server handles one change at a time. Checking that the time is free and saving it happen in one uninterrupted step, so two requests can never both pass the check
- The second flat gets a clear message with who has the time, for example "Diese Zeit ist schon reserviert: 10–14 Uhr, Wohnung 1.06", and sees the updated day
- Every open app is told at once when anything changes (a live connection, with a 30-second check as fallback). In the test, another flat's screen updated without reloading
- The day buttons show "frei", "teils" or "voll" for the chosen thing, so taken days are visible before a day is opened
- While someone is typing in a form, new data waits until the form is closed, so nothing they typed is lost

## Admin area

Six sections, all with add, edit and delete:

| Section | What admins set |
|---|---|
| Reservierbares | Name, kind, hint (for example the price), earliest and latest hour, minimum and maximum duration, whole day only, how far ahead, whether it may repeat and for how many months, paused or active |
| Anlässe | Title, day, time or whole day, place (reserved automatically), description, picture |
| Infotafel | Notices, important ones on top |
| Wohnungen | Accounts: name, login, role (Bewohner or Admin), initial password |
| Reservationen | All upcoming reservations in the house, cancel any |
| Kontakt | Admin email, WhatsApp invite link, sender name for notices |

## Technology

| Part | Choice | Why |
|---|---|---|
| App | Web app that can be added to the home screen. No app store | One version for phone, tablet and PC. Updates itself |
| Code | Plain HTML, CSS and JavaScript, no framework | Small download, quick on old phones |
| Server | One Node.js program, no packages to install | Little to maintain, nothing to keep up to date except Node |
| Rules | One file (`public/core.js`) holds every check. Server and demo both run it | The demo behaves exactly like the real app |
| Data | One file on the server, written safely after every change, daily backup kept for 30 days | Simple to back up and move. Fits one building |

Limits of this choice: it is built for one building and one server program. That is what makes double bookings impossible without a database. It would need a database if it ever had to serve many buildings.

## Tested

`npm test` starts a real server and checks, among others:

- 20 flats reserve the same hours at the same moment: exactly one gets them
- Overlapping times at the same moment never both succeed
- A change reaches other logged-in flats without reloading
- Minimum and maximum duration, the 4-month limit for repeats, skipping taken dates
- Residents cannot use admin functions or cancel other flats' reservations
- Password change, new initial password, data kept across a restart, passwords not stored readable

Also run in real browsers: an admin and two flats at the same time, including two flats pressing "Jetzt reservieren" on the same hours.

Not tested: picture upload, wheel feel on a real touch screen, contrast in sunlight, a real hosting setup.

## Next steps

1. Choose where to host it (see open questions) and put it online with an own address and HTTPS
2. Review with a few residents, including seniors. Collect changes
3. Admin creates the flat accounts and hands out initial passwords
4. Test with one floor for two weeks, then switch over

## Open questions

- Where should it be hosted, and what yearly budget is acceptable? It needs a place that runs a Node.js program all the time and keeps its data folder. A Swiss host is possible
- Which address should the app have (for example app.oele51.ch)?
- Which rooms and tables exist? "Festtisch 1 / 2" are examples. Admins can fix this in the app
- Is the app in German only?

## Not checked

beunity.app could not be opened from the work environment, so this plan is based on the wishes listed above, not on a feature comparison.
