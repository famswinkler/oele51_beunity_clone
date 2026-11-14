# Oele51 Hausverein app: plan

Status: draft for the Hausverein, 14 Nov 2026. Nothing here is decided yet.

## Goal

A small, fast app for the residents of Oele51 that replaces the current house app for four things only:

1. Reserve rooms, tables and similar shared things
2. Plan events, linked to the room reservation
3. Reserve the washing machine on each of the 4 floors
4. Read and post on an info board

Plus: one-time login, an email link to the admins, and a link to the WhatsApp group.

Everything else the current app does (chat, marketplace, working groups, damage reports) is out of scope. Chat moves to WhatsApp.

## Design rules (for senior residents)

- Text at least 18 px, buttons at least 56 px high, strong contrast
- Start page shows four large tiles and nothing hidden behind a menu
- A bottom bar with icon and word is visible on every screen
- A reservation takes three taps: what, day, time. Then one confirmation
- Plain Swiss German words: Reservation, Anlass, Waschküche, Infotafel
- Status is shown in words, not colour alone: "Frei", "Belegt · Name", "Meine Reservation"
- Deleting always asks "Ja / Nein" first
- Colours from the logo: sage green, charcoal, the peach of the balconies, on a light ground. Dark mode included
- Typeface: Atkinson Hyperlegible, made for readers with low vision

## Screens

| Screen | What it does |
|---|---|
| Login | Logo, username, password, "show password". Stays logged in on the device |
| Start | Greeting, date, four tiles with live status, my reservations, contact block |
| Räume & Tische | Pick a room or table, a day, a time slot, confirm |
| Waschküche | Same flow, pick the floor first. The app remembers the floor |
| Anlässe | List of events, "Ich komme" button, new event with automatic room reservation and clash warning |
| Infotafel | Notices, important ones on top, residents can post |

A clickable prototype of all six screens is in `prototype/index.html`. It uses example data stored only in the browser.

## Rules built into the prototype

- Washing slots: 07–10, 10–13, 13–16, 16–19, 19–22. None at night, as the house rules forbid washing 22:00–07:00
- Rooms: Vormittag 08–12, Nachmittag 12–17, Abend 17–22 (proposal)
- Guest room: per night
- Prices shown as hints: community room CHF 20 per day for private events, guest room CHF 20 per night (WBG price list of 29.09.2025, to be confirmed)
- An event that needs a room creates the reservation itself. Cancelling the event frees the room

## Proposed technology

| Part | Proposal | Why |
|---|---|---|
| App | Web app that can be added to the home screen (PWA). No app store | One version for phone, tablet and PC. Opens fast. Updates itself |
| Code | Plain HTML, CSS and JavaScript, as in the prototype | Small download, quick on old phones |
| Data and login | A hosted database with built-in login, for example Supabase with a Swiss or EU region | Little to maintain for volunteers. Region and cost need checking before deciding |
| Login | Username and password. The session is kept on the device and renewed silently | Residents log in once per device |
| Roles | Resident, admin | Admins manage users, rooms, slots, pinned notices |
| Hosting | Static hosting with an own address, for example app.oele51.ch | Cheap and simple |

Alternative: a small own server (Node and SQLite) at a Swiss host. More control, more upkeep.

## Admin area (not in the prototype yet)

- Create residents and reset passwords
- Edit rooms, tables, floors and time slots
- Set the admin email and the WhatsApp invite link
- Pin or remove notices, remove any reservation

## Steps

1. Review the prototype with a few residents, including seniors. Collect changes
2. Decide the open questions below
3. Build data storage, login and the admin area
4. Test with one floor for two weeks
5. Import residents, hand out logins, switch over

## Open questions

- Which rooms and tables can be reserved? "Festtisch 1 / 2" in the prototype are examples
- How are the four floors named (EG, 1. Stock ...)? One washing machine per floor, or also a tumbler to reserve?
- Are the time slots right? Is there a limit per household per week?
- Admin email address and WhatsApp invite link
- May every resident post on the info board, or only admins?
- "Du" or "Sie" in the app? The prototype avoids both where it can
- One login per person or per flat?
- Where should the data be hosted, and what yearly budget is acceptable?
- Is the app in German only?

## Not checked

beunity.app could not be opened from the work environment, so this plan is based on the wishes listed above, not on a feature comparison.
