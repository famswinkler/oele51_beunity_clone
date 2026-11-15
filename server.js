/* Oele51 server. No packages to install: plain Node.js (version 20 or newer).
   Start:  node server.js
   Settings (environment variables):
     PORT      port to listen on (default 3000)
     DATA_DIR  folder for the data file and its backups (default ./data)
     TZ_NAME   time zone of the house (default Europe/Zurich)

   Why two people can never get the same time: Node handles one request at a time,
   and every change (check that the time is free, then save it) runs from start to
   finish in core.js before the next request is looked at. The second request finds
   the time taken and gets a clear message. */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const core = require('./public/core.js');

const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const YEAR = 365 * 24 * 3600;

/* ---------- passwords ---------- */
function hash(pw) { const salt = crypto.randomBytes(16); return 'scrypt$' + salt.toString('hex') + '$' + crypto.scryptSync(pw, salt, 32).toString('hex'); }
function verify(pw, stored) {
  const p = String(stored || '').split('$'); if (p.length !== 3 || p[0] !== 'scrypt') return false;
  const a = Buffer.from(p[2], 'hex'), b = crypto.scryptSync(pw, Buffer.from(p[1], 'hex'), 32);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const WORDS = ['Garten', 'Balkon', 'Sonne', 'Linde', 'Apfel', 'Wolke', 'Brunnen', 'Wiese'];
const easyPassword = () => WORDS[crypto.randomInt(WORDS.length)] + '-' + crypto.randomInt(1000, 9999);
const sha = t => crypto.createHash('sha256').update(t).digest('hex');

function start(opts) {
  opts = opts || {};
  const DATA = opts.dataDir || process.env.DATA_DIR || path.join(__dirname, 'data');
  const FILE = path.join(DATA, 'state.json');
  const TZ = process.env.TZ_NAME || 'Europe/Zurich';
  const log = opts.quiet ? () => {} : console.log;
  fs.mkdirSync(path.join(DATA, 'backups'), { recursive: true });

  /* ---------- data: one file, written safely after every change, daily backups ---------- */
  let state;
  if (fs.existsSync(FILE)) state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  else {
    state = core.seed();
    const pw = opts.adminPassword || easyPassword();
    state.users.push({ id: 'u' + (state.seq++), login: 'admin', name: 'Vorstand', role: 'admin', pw: hash(pw), initial: true });
    fs.writeFileSync(path.join(DATA, 'erstes-passwort.txt'), 'Benutzername: admin\nPasswort: ' + pw + '\n\nBitte nach dem ersten Anmelden ändern und diese Datei löschen.\n');
    log('\nErster Start. Admin-Konto angelegt:\n  Benutzername: admin\n  Passwort:     ' + pw + '\n(steht auch in ' + path.join(DATA, 'erstes-passwort.txt') + ')\n');
  }
  function persist() {
    const tmp = FILE + '.tmp', fd = fs.openSync(tmp, 'w');
    fs.writeSync(fd, JSON.stringify(state)); fs.fsyncSync(fd); fs.closeSync(fd); fs.renameSync(tmp, FILE);
  }
  function backup() {
    const dir = path.join(DATA, 'backups'), f = path.join(dir, 'state-' + today() + '.json');
    if (!fs.existsSync(f) && fs.existsSync(FILE)) fs.copyFileSync(FILE, f);
    fs.readdirSync(dir).sort().slice(0, -30).forEach(old => fs.unlinkSync(path.join(dir, old)));
  }
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const nowHour = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
  persist(); backup();
  const backupTimer = setInterval(backup, 3600 * 1000); backupTimer.unref();

  /* ---------- live updates: every open app is told at once when something changes ---------- */
  const listeners = new Set();
  const announce = () => listeners.forEach(res => res.write('data: ' + state.version + '\n\n'));
  const beat = setInterval(() => listeners.forEach(res => res.write(': ok\n\n')), 25000); beat.unref();

  /* ---------- helpers ---------- */
  const send = (res, code, obj, headers) => { res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {})); res.end(JSON.stringify(obj)); };
  const cookieOf = req => { const m = /(?:^|;\s*)oele=([a-f0-9]{64})/.exec(req.headers.cookie || ''); return m && m[1]; };
  const secure = req => req.headers['x-forwarded-proto'] === 'https' || !!req.socket.encrypted;
  const setCookie = (req, token, age) => 'oele=' + token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + age + (secure(req) ? '; Secure' : '');
  function userOf(req) {
    const t = cookieOf(req); if (!t) return null;
    const ses = state.sessions[sha(t)]; if (!ses) return null;
    const u = state.users.find(x => x.id === ses.user); if (!u) return null;
    if (ses.seen !== today()) { ses.seen = today(); persist(); }
    return u;
  }
  function readJson(req) {
    return new Promise((resolve, reject) => {
      let size = 0; const parts = [];
      req.on('data', c => { size += c.length; if (size > 600000) { reject(Object.assign(new Error('Das ist zu gross.'), { status: 413, expose: true })); req.destroy(); } else parts.push(c); });
      req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(parts).toString('utf8') || '{}')); } catch (e) { reject(Object.assign(new Error('Ungültige Anfrage.'), { status: 400, expose: true })); } });
      req.on('error', reject);
    });
  }
  const tries = new Map();   // login attempts, to slow down guessing
  function throttled(key) { const t = tries.get(key); return t && t.n >= 8 && Date.now() < t.until; }
  function failedTry(key) { const t = tries.get(key); if (!t || Date.now() > t.until) tries.set(key, { n: 1, until: Date.now() + 15 * 60000 }); else t.n++; }
  const ctxOf = user => ({ user, today: today(), nowHour: nowHour(), hash, verify });
  function viewFor(user) {
    const v = core.view(state, ctxOf(user));
    v.events.forEach(e => { e.img = e.img ? 'api/img/' + e.id + '?v=' + state.version : ''; });
    return v;
  }

  /* ---------- requests ---------- */
  async function api(req, res, url) {
    if (req.method === 'POST') {
      const origin = req.headers.origin;   // a form on another website must not act for a logged-in flat
      if (origin && new URL(origin).host !== req.headers.host) return send(res, 403, { error: 'Diese Anfrage kommt von einer fremden Seite.' });
    }
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const body = await readJson(req), login = String(body.login || '').trim().toLowerCase();
      const key = login + '|' + req.socket.remoteAddress;
      if (throttled(key)) return send(res, 429, { error: 'Zu viele Versuche. Bitte warte 15 Minuten oder frag die Admins nach einem neuen Passwort.' });
      const u = core.findUser(state, login);
      if (!u || !verify(String(body.password || ''), u.pw)) { failedTry(key); return send(res, 401, { error: 'Benutzername oder Passwort stimmt nicht.' }); }
      tries.delete(key);
      const token = crypto.randomBytes(32).toString('hex');
      state.sessions[sha(token)] = { user: u.id, seen: today() }; persist();
      return send(res, 200, { ok: true }, { 'Set-Cookie': setCookie(req, token, YEAR) });
    }
    if (url.pathname === '/api/logout' && req.method === 'POST') {
      const t = cookieOf(req); if (t && state.sessions[sha(t)]) { delete state.sessions[sha(t)]; persist(); }
      return send(res, 200, { ok: true }, { 'Set-Cookie': setCookie(req, '', 0) });
    }
    const user = userOf(req);
    if (!user) return send(res, 401, { error: 'Bitte melde dich an.' });
    if (url.pathname === '/api/state' && req.method === 'GET') return send(res, 200, viewFor(user), { 'Set-Cookie': setCookie(req, cookieOf(req), YEAR) });
    if (url.pathname === '/api/act' && req.method === 'POST') {
      const body = await readJson(req);
      const result = core.act(state, ctxOf(user), String(body.name), body.p);   // check and save in one uninterrupted step
      persist(); announce();
      return send(res, 200, { ok: true, result, state: viewFor(user) });
    }
    if (url.pathname === '/api/stream' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' });
      res.write('data: ' + state.version + '\n\n'); listeners.add(res);
      req.on('close', () => listeners.delete(res)); return;
    }
    if (url.pathname.startsWith('/api/img/') && req.method === 'GET') {
      const e = state.events.find(x => x.id === url.pathname.slice(9)), m = e && /^data:(image\/\w+);base64,(.*)$/.exec(e.img || '');
      if (!m) return send(res, 404, { error: 'Kein Bild.' });
      res.writeHead(200, { 'Content-Type': m[1], 'Cache-Control': 'private, max-age=31536000, immutable' }); return res.end(Buffer.from(m[2], 'base64'));
    }
    send(res, 404, { error: 'Das gibt es nicht.' });
  }

  function file(req, res, url) {
    let p = decodeURIComponent(url.pathname); if (p === '/') p = '/index.html';
    const full = path.normalize(path.join(PUBLIC, p));
    if (!full.startsWith(PUBLIC + path.sep) || !TYPES[path.extname(full)] || !fs.existsSync(full)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Nicht gefunden'); }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(full)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-ancestors 'none'"
    });
    fs.createReadStream(full).pipe(res);
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (!url.pathname.startsWith('/api/')) return file(req, res, url);
    api(req, res, url).catch(e => {
      if (!e.expose) console.error(e);
      if (!res.headersSent) send(res, e.expose ? e.status || 400 : 500, { error: e.expose ? e.message : 'Da ist etwas schiefgelaufen. Bitte versuche es nochmals.' });
    });
  });
  return new Promise(resolve => server.listen(opts.port != null ? opts.port : (process.env.PORT || 3000), () => {
    log('Oele51 läuft auf Port ' + server.address().port + '. Daten in ' + DATA);
    resolve({ server, port: server.address().port, close: () => new Promise(r => { listeners.forEach(l => l.end()); server.close(r); server.closeAllConnections(); }) });
  }));
}

module.exports = { start, easyPassword };
if (require.main === module) start();
