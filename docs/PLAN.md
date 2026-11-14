# Oele51 Hausverein app: plan

Status: draft for the Hausverein, 14 Nov 2026.

## Decided (14 Nov 2026)

- Admins can add, edit and remove anything that can be reserved
- Reservations are flexible: from 1 hour up to the whole day
- One login per flat
- The app says "Du"
- Only admins post notices on the info board
- The info board opens the start page, with the next event first and a picture if there is one
- Admin email and WhatsApp link do not exist yet. Admins enter them later in the app

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
- A reservation takes few taps: what, day, first hour, last hour. Then one confirmation
- Plain Swiss German words: Reservation, Anlass, Waschküche, Infotafel
- Status is shown in words, not colour alone: "Frei", "Belegt · Name", "Meine Reservation"
- Deleting always asks "Ja / Nein" first
- Colours from the logo: sage green, charcoal, the peach of the balconies, on a light ground. Dark mode included
- Typeface: Atkinson Hyperlegible, made for readers with low vision

## Screens

| Screen | What it does |
|---|---|
| Login | Logo, flat number, password, "show password". Stays logged in on the device |
| Start | Info board first: next event with picture, further events, notices. Then three wide buttons to reserve, my reservations, contact block |
| Räume | Pick a room, table or other thing, a day, the first and last hour (or "Ganzer Tag"), confirm |
| Waschen | Same flow, pick the floor first. The app remembers the floor |
| Anlässe | List of events with picture, "Wir kommen" button, new event with automatic room reservation and clash warning |
| Verwalten (admins) | Add, edit, delete what can be reserved. Set admin email and WhatsApp link |

A clickable prototype of all screens is in `prototype/index.html`. It uses example data stored only in the browser. Tick "Als Admin anmelden" on the login screen to see the admin area.

## Rules built into the prototype

- Every reservable thing has a name, a kind (Raum, Tisch, Waschmaschine, Anderes), an optional hint, opening hours, and a switch "whole day only"
- Default hours are 07–22, as the house rules forbid washing 22:00–07:00. Admins can change them per thing
- Reservations are in whole hours, 1 hour up to the whole day
- Washing machines are named Erdgeschoss, 1. Stock, 2. Stock, 3. Stock (editable)
- Guest room: whole day only
- Residents plan events. Admins can cancel any event
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

## Admin area

In the prototype: manage reservable things, contact details, notices, cancel events.

Still to build: create flat logins, reset passwords, remove any reservation.

## Steps

1. Review the prototype with a few residents, including seniors. Collect changes
2. Decide the open questions below
3. Build data storage, login and the admin area
4. Test with one floor for two weeks
5. Import residents, hand out logins, switch over

## Open questions

- Which rooms and tables exist? "Festtisch 1 / 2" are examples. Admins can now fix this in the app
- Is there a limit per flat per week, for example for the washing machine?
- May every flat plan events, or only admins?
- Where should the data be hosted, and what yearly budget is acceptable?
- Is the app in German only?

## Not checked

beunity.app could not be opened from the work environment, so this plan is based on the wishes listed above, not on a feature comparison.
