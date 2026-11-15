/* Oele51 rules: every check and every change to the data lives here.
   The server runs this file for the real app; the demo runs the same file in the browser. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OeleCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CATS = { raum: 'Raum', tisch: 'Tisch', wasch: 'Waschmaschine', anderes: 'Anderes' };
  const pad = n => String(n).padStart(2, '0');
  const span = (a, b) => pad(a) + '–' + pad(b) + ' Uhr';
  const hoursText = n => n === 1 ? '1 Stunde' : n + ' Stunden';

  function fail(msg, status) { const e = new Error(msg); e.status = status || 400; e.expose = true; throw e; }
  function isDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T12:00:00Z')); }
  function addDays(d, n) { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
  function addMonths(d, n) {
    const x = new Date(d + 'T12:00:00Z'); const day = x.getUTCDate();
    x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + n);
    const last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
    x.setUTCDate(Math.min(day, last)); return x.toISOString().slice(0, 10);
  }
  const int = (v, lo, hi, def) => { v = Number(v); return Number.isInteger(v) ? Math.max(lo, Math.min(hi, v)) : def; };
  const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
  const nextId = (s, p) => p + (s.seq++);

  function seed() {
    const s = { v: 1, seq: 1, version: 1, settings: { email: '', whatsapp: '', sender: 'Vorstand' }, users: [], sessions: {}, resources: [], bookings: [], events: [], posts: [] };
    const R = (name, cat, hint, extra) => s.resources.push(Object.assign({ id: nextId(s, 'r'), name, cat, hint, open: 7, close: 22, minH: 1, maxH: 0, dayOnly: false, aheadDays: 125, repeat: false, repeatMonths: 4, active: true }, extra || {}));
    R('Gemeinschaftsraum', 'raum', 'Privater Anlass CHF 20 pro Tag');
    R('Terrasse', 'raum', 'Beim Gemeinschaftsraum');
    R('Gästezimmer', 'raum', 'CHF 20 pro Nacht', { dayOnly: true });
    R('Festtisch 1', 'tisch', 'Beispiel');
    R('Festtisch 2', 'tisch', 'Beispiel');
    ['Erdgeschoss', '1. Stock', '2. Stock', '3. Stock'].forEach(n => R(n, 'wasch', 'Waschmaschine', { repeat: true }));
    return s;
  }

  const findUser = (s, login) => { const l = str(login, 120).toLowerCase(); return s.users.find(u => u.login === l); };
  const resOf = (s, id) => s.resources.find(r => r.id === id);
  const nameOf = (s, id) => { const u = s.users.find(x => x.id === id); return u ? u.name : 'Ehemalige Wohnung'; };
  const clashOf = (s, res, date, from, to, except) => s.bookings.find(b => b.res === res && b.date === date && b.from < to && from < b.to && b.id !== except);

  /* What one logged-in flat is allowed to see. */
  function view(s, ctx) {
    const u = ctx.user, admin = u.role === 'admin', t = ctx.today;
    return {
      version: s.version, today: t, nowHour: ctx.nowHour,
      me: { id: u.id, name: u.name, login: u.login, role: u.role, initial: !!u.initial },
      settings: s.settings,
      resources: s.resources.filter(r => admin || r.active),
      bookings: s.bookings.filter(b => b.date >= t).map(b => ({ id: b.id, res: b.res, date: b.date, from: b.from, to: b.to, by: nameOf(s, b.user), mine: b.user === u.id, ev: b.ev || null, series: b.series || null, every: b.every || 0 })),
      events: s.events.filter(e => e.date >= t).map(e => ({ id: e.id, title: e.title, date: e.date, from: e.from, to: e.to, all: !!e.all, res: e.res, desc: e.desc, img: e.img || '', by: s.settings.sender, going: e.going.length, iGo: e.going.includes(u.id) })),
      posts: s.posts,
      users: admin ? s.users.map(x => ({ id: x.id, login: x.login, name: x.name, role: x.role, initial: !!x.initial })) : undefined
    };
  }

  /* Returns null when the time can be reserved, otherwise { msg, status }. */
  function checkSlot(s, ctx, r, date, from, to, o) {
    o = o || {};
    if (!isDate(date)) return { msg: 'Dieser Tag ist ungültig.' };
    if (date < ctx.today) return { msg: 'Dieser Tag ist schon vorbei.' };
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < r.open || to > r.close || from >= to) return { msg: r.name + ' kann nur von ' + span(r.open, r.close) + ' reserviert werden.' };
    if (!o.event) {
      const whole = from === r.open && to === r.close, dur = to - from;
      if (!r.active) return { msg: r.name + ' kann im Moment nicht reserviert werden.' };
      if (!o.inSeries && date > addDays(ctx.today, r.aheadDays)) return { msg: r.name + ' kann höchstens ' + r.aheadDays + ' Tage im Voraus reserviert werden.' };
      if (r.dayOnly && !whole) return { msg: r.name + ' gibt es nur für den ganzen Tag.' };
      if (dur < r.minH) return { msg: 'Mindestens ' + hoursText(r.minH) + ' reservieren.' };
      if (r.maxH && dur > r.maxH) return { msg: 'Höchstens ' + hoursText(r.maxH) + ' am Stück reservieren.' };
      if (date === ctx.today && !r.dayOnly && from <= ctx.nowHour) return { msg: 'Diese Zeit ist schon vorbei.' };
    }
    const c = clashOf(s, r.id, date, from, to, o.except);
    if (c) return { msg: 'Diese Zeit ist schon reserviert: ' + span(c.from, c.to) + ', ' + nameOf(s, c.user) + '.', status: 409 };
    return null;
  }

  const ACTIONS = {
    book(s, ctx, p) {
      const r = resOf(s, p.res) || fail('Das gibt es nicht mehr.', 404);
      const from = Number(p.from), to = Number(p.to), every = int(p.every, 0, 2, 0);
      const first = checkSlot(s, ctx, r, p.date, from, to);
      if (first) fail(first.msg, first.status);
      const dates = [p.date];
      if (every) {
        if (!r.repeat) fail(r.name + ' lässt sich nicht wiederholt reservieren.');
        const lim = addMonths(ctx.today, int(p.months, 1, r.repeatMonths, r.repeatMonths));
        for (let d = addDays(p.date, 7 * every); d <= lim; d = addDays(d, 7 * every)) dates.push(d);
      }
      const series = dates.length > 1 ? nextId(s, 's') : null; let made = 0;
      dates.forEach((d, i) => {
        if (i && checkSlot(s, ctx, r, d, from, to, { inSeries: true })) return;
        const b = { id: nextId(s, 'b'), res: r.id, date: d, from, to, user: ctx.user.id };
        if (series) { b.series = series; b.every = every; }
        s.bookings.push(b); made++;
      });
      return { made, skipped: dates.length - made };
    },
    cancel(s, ctx, p) {
      const b = s.bookings.find(x => x.id === p.id) || fail('Diese Reservation gibt es nicht mehr.', 404);
      if (b.user !== ctx.user.id && ctx.user.role !== 'admin') fail('Das ist nicht deine Reservation.', 403);
      if (b.ev) fail('Diese Reservation gehört zu einem Anlass. Sag den Anlass ab.');
      s.bookings = s.bookings.filter(x => x !== b); return {};
    },
    cancelSeries(s, ctx, p) {
      const mine = b => b.series === p.series && b.date >= ctx.today && (b.user === ctx.user.id || ctx.user.role === 'admin');
      const n = s.bookings.filter(mine).length; if (!n) fail('Diese Reservationen gibt es nicht mehr.', 404);
      s.bookings = s.bookings.filter(b => !mine(b)); return { removed: n };
    },
    going(s, ctx, p) {
      const e = s.events.find(x => x.id === p.event) || fail('Diesen Anlass gibt es nicht mehr.', 404);
      e.going = e.going.filter(id => id !== ctx.user.id); if (p.on) e.going.push(ctx.user.id); return {};
    },
    password(s, ctx, p) {
      if (!ctx.verify(String(p.old || ''), ctx.user.pw)) fail('Das bisherige Passwort stimmt nicht.');
      if (String(p.new || '').length < 6) fail('Das neue Passwort braucht mindestens 6 Zeichen.');
      ctx.user.pw = ctx.hash(String(p.new)); ctx.user.initial = false; return {};
    },

    /* ----- admins only ----- */
    resSave(s, ctx, p) {
      const name = str(p.name, 40) || fail('Bitte gib einen Namen ein.');
      const open = int(p.open, 0, 23, 7), close = int(p.close, 1, 24, 22);
      if (close <= open) fail('«Spätestens bis» muss später sein als «Frühestens ab».');
      const len = close - open, minH = int(p.minH, 1, 24, 1), maxH = int(p.maxH, 0, 24, 0);
      if (minH > len) fail('Die Mindestdauer ist länger als die Öffnungszeit.');
      if (maxH && maxH < minH) fail('Die Höchstdauer muss mindestens so lang sein wie die Mindestdauer.');
      const data = { name, cat: CATS[p.cat] ? p.cat : 'anderes', hint: str(p.hint, 60), open, close, minH, maxH: maxH >= len ? 0 : maxH, dayOnly: !!p.dayOnly, aheadDays: int(p.aheadDays, 1, 366, 125), repeat: !!p.repeat, repeatMonths: int(p.repeatMonths, 1, 12, 4), active: p.active !== false };
      if (p.id) Object.assign(resOf(s, p.id) || fail('Das gibt es nicht mehr.', 404), data);
      else s.resources.push(Object.assign({ id: nextId(s, 'r') }, data));
      return {};
    },
    resDelete(s, ctx, p) {
      s.resources = s.resources.filter(r => r.id !== p.id); s.bookings = s.bookings.filter(b => b.res !== p.id);
      s.events.forEach(e => { if (e.res === p.id) e.res = null; }); return {};
    },
    eventSave(s, ctx, p) {
      const old = p.id ? (s.events.find(e => e.id === p.id) || fail('Diesen Anlass gibt es nicht mehr.', 404)) : null;
      const title = str(p.title, 60) || fail('Bitte gib einen Titel ein.');
      if (!isDate(p.date) || (!old && p.date < ctx.today)) fail('Bitte wähle einen Tag ab heute.');
      const r = p.res ? (resOf(s, p.res) || fail('Diesen Ort gibt es nicht mehr.', 404)) : null;
      const all = !!p.all || !!(r && r.dayOnly);
      const from = all ? (r ? r.open : 7) : Number(p.from), to = all ? (r ? r.close : 22) : Number(p.to);
      if (!Number.isInteger(from) || !Number.isInteger(to) || to <= from || from < 0 || to > 24) fail('«Bis» muss später sein als «Von».');
      const own = old && s.bookings.find(b => b.ev === old.id);
      if (r) { const c = checkSlot(s, ctx, r, p.date, from, to, { event: true, except: own && own.id }); if (c) fail(c.msg, c.status); }
      let img = old ? old.img : '';
      if (typeof p.img === 'string') img = /^data:image\/(jpeg|png|webp);base64,/.test(p.img) && p.img.length < 400000 ? p.img : '';
      const e = old || { id: nextId(s, 'e'), going: [], user: ctx.user.id };
      Object.assign(e, { title, date: p.date, from, to, all, res: r ? r.id : null, desc: str(p.desc, 400), img });
      if (!old) s.events.push(e);
      s.bookings = s.bookings.filter(b => b.ev !== e.id);
      if (r) s.bookings.push({ id: nextId(s, 'b'), res: r.id, date: e.date, from, to, user: ctx.user.id, ev: e.id });
      return { id: e.id };
    },
    eventDelete(s, ctx, p) { s.events = s.events.filter(e => e.id !== p.id); s.bookings = s.bookings.filter(b => b.ev !== p.id); return {}; },
    postSave(s, ctx, p) {
      const title = str(p.title, 80), body = str(p.body, 800);
      if (!title || !body) fail('Bitte gib Titel und Text ein.');
      const old = p.id && s.posts.find(x => x.id === p.id);
      if (old) Object.assign(old, { title, body, important: !!p.important });
      else s.posts.push({ id: nextId(s, 'p'), title, body, important: !!p.important, by: s.settings.sender, date: ctx.today });
      return {};
    },
    postDelete(s, ctx, p) { s.posts = s.posts.filter(x => x.id !== p.id); return {}; },
    userSave(s, ctx, p) {
      const name = str(p.name, 40) || fail('Bitte gib einen Namen ein, zum Beispiel «Wohnung 1.06».');
      const login = str(p.login, 120).toLowerCase() || fail('Bitte gib eine E-Mail-Adresse oder einen Benutzernamen ein.');
      if (/\s/.test(login)) fail('E-Mail oder Benutzername darf keine Leerzeichen enthalten.');
      const role = p.role === 'admin' ? 'admin' : 'resident', pw = String(p.password || '');
      const old = p.id ? (s.users.find(u => u.id === p.id) || fail('Dieses Konto gibt es nicht mehr.', 404)) : null;
      const same = findUser(s, login); if (same && same !== old) fail('«' + login + '» ist schon vergeben.');
      if (!old && pw.length < 6) fail('Das Startpasswort braucht mindestens 6 Zeichen.');
      if (pw && pw.length < 6) fail('Das Passwort braucht mindestens 6 Zeichen.');
      if (old && old.role === 'admin' && role !== 'admin' && s.users.filter(u => u.role === 'admin').length < 2) fail('Es braucht mindestens einen Admin.');
      const u = old || { id: nextId(s, 'u') };
      Object.assign(u, { name, login, role });
      if (pw) { u.pw = ctx.hash(pw); u.initial = true; Object.keys(s.sessions).forEach(k => { if (s.sessions[k].user === u.id && u !== ctx.user) delete s.sessions[k]; }); }
      if (!old) s.users.push(u);
      return {};
    },
    userDelete(s, ctx, p) {
      const u = s.users.find(x => x.id === p.id) || fail('Dieses Konto gibt es nicht mehr.', 404);
      if (u === ctx.user) fail('Du kannst dein eigenes Konto nicht löschen.');
      s.users = s.users.filter(x => x !== u);
      s.bookings = s.bookings.filter(b => b.user !== u.id || b.ev);
      s.events.forEach(e => { e.going = e.going.filter(id => id !== u.id); });
      Object.keys(s.sessions).forEach(k => { if (s.sessions[k].user === u.id) delete s.sessions[k]; });
      return {};
    },
    settings(s, ctx, p) {
      const email = str(p.email, 120), whatsapp = str(p.whatsapp, 200), sender = str(p.sender, 40) || 'Vorstand';
      if (email && !/^\S+@\S+\.\S+$/.test(email)) fail('Diese E-Mail-Adresse sieht nicht richtig aus.');
      if (whatsapp && !/^https:\/\//.test(whatsapp)) fail('Der Link muss mit https:// beginnen.');
      s.settings = { email, whatsapp, sender }; return {};
    }
  };
  const FOR_ALL = { book: 1, cancel: 1, cancelSeries: 1, going: 1, password: 1 };

  /* The single entry point for every change. Runs to completion before the next one starts. */
  function act(s, ctx, name, p) {
    if (!Object.prototype.hasOwnProperty.call(ACTIONS, name)) fail('Das kennt die App nicht.', 404);
    if (!FOR_ALL[name] && ctx.user.role !== 'admin') fail('Das dürfen nur Admins.', 403);
    const out = ACTIONS[name](s, ctx, p || {});
    s.version++;
    return out;
  }

  return { CATS, seed, view, act, findUser, addDays, addMonths, span, hoursText, pad };
});
