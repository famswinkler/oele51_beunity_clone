/* Starts a real server on a temporary folder and talks to it over HTTP, like the app does. */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), os = require('os'), path = require('path');
const { start } = require('../server.js');
const core = require('../public/core.js');

let app, base;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oele51-'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => core.addDays(today, n);

async function req(method, url, body, cookie) {
  const r = await fetch(base + url, { method, headers: Object.assign(body ? { 'Content-Type': 'application/json' } : {}, cookie ? { Cookie: cookie } : {}), body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, json: await r.json().catch(() => ({})), cookie: (r.headers.get('set-cookie') || '').split(';')[0] };
}
const login = async (l, p) => { const r = await req('POST', '/api/login', { login: l, password: p }); assert.equal(r.status, 200, 'login ' + l); return r.cookie; };
const act = (cookie, name, p) => req('POST', '/api/act', { name, p }, cookie);
const state = async cookie => (await req('GET', '/api/state', null, cookie)).json;

test.before(async () => { app = await start({ port: 0, dataDir: dir, adminPassword: 'Start-1234', quiet: true }); base = 'http://127.0.0.1:' + app.port; });
test.after(async () => { await app.close(); fs.rmSync(dir, { recursive: true, force: true }); });

let admin, flats = [], wash, room;
test('admin logs in and creates 20 flat accounts, by short name or by email', async () => {
  admin = await login('admin', 'Start-1234');
  for (let i = 1; i <= 20; i++) {
    const l = i % 2 ? '1.' + String(i).padStart(2, '0') : 'flat' + i + '@example.org';
    assert.equal((await act(admin, 'userSave', { name: 'Wohnung ' + i, login: l, password: 'Garten-' + (1000 + i) })).status, 200);
    flats.push(await login(l.toUpperCase(), 'Garten-' + (1000 + i)));   // login is not case sensitive
  }
  const s = await state(admin);
  wash = s.resources.find(r => r.cat === 'wasch').id; room = s.resources.find(r => r.name === 'Gemeinschaftsraum').id;
  assert.equal(s.users.length, 21);
});

test('wrong password is refused, no account means no data', async () => {
  assert.equal((await req('POST', '/api/login', { login: 'admin', password: 'nope' })).status, 401);
  assert.equal((await req('GET', '/api/state')).status, 401);
  assert.equal((await req('GET', '/api/state', null, 'oele=' + 'a'.repeat(64))).status, 401);
});

test('20 flats reserve the same hours at the same moment: exactly one gets them', async () => {
  const res = await Promise.all(flats.map(c => act(c, 'book', { res: wash, date: day(2), from: 9, to: 11 })));
  assert.equal(res.filter(r => r.status === 200).length, 1);
  assert.equal(res.filter(r => r.status === 409).length, 19);
  const s = await state(flats[5]);
  assert.equal(s.bookings.filter(b => b.res === wash && b.date === day(2)).length, 1);
});

test('overlapping times at the same moment never both succeed; touching times both do', async () => {
  const [a, b, c] = await Promise.all([
    act(flats[0], 'book', { res: wash, date: day(3), from: 8, to: 11 }),
    act(flats[1], 'book', { res: wash, date: day(3), from: 10, to: 12 }),
    act(flats[2], 'book', { res: wash, date: day(3), from: 12, to: 13 })
  ]);
  assert.equal([a, b].filter(r => r.status === 200).length, 1);
  assert.equal(c.status, 200);
});

test('every flat sees a new reservation at once (live update)', async () => {
  const r = await fetch(base + '/api/stream', { headers: { Cookie: flats[3] } });
  const reader = r.body.getReader(), dec = new TextDecoder();
  await reader.read();                                   // first message: current version
  await act(flats[4], 'book', { res: wash, date: day(4), from: 14, to: 15 });
  const msg = dec.decode((await reader.read()).value);
  assert.match(msg, /^data: \d+/);
  await reader.cancel();
});

test('minimum and maximum duration set by the admin are enforced', async () => {
  const s = await state(admin), r = s.resources.find(x => x.id === wash);
  assert.equal((await act(admin, 'resSave', Object.assign({}, r, { minH: 2, maxH: 4 }))).status, 200);
  assert.equal((await act(flats[0], 'book', { res: wash, date: day(5), from: 8, to: 9 })).status, 400);
  assert.equal((await act(flats[0], 'book', { res: wash, date: day(5), from: 8, to: 13 })).status, 400);
  assert.equal((await act(flats[0], 'book', { res: wash, date: day(5), from: 8, to: 12 })).status, 200);
  assert.equal((await act(admin, 'resSave', Object.assign({}, r, { minH: 1, maxH: 0 }))).status, 200);
});

test('repeating reservation: at most 4 months, taken dates are skipped', async () => {
  await act(flats[1], 'book', { res: wash, date: day(13), from: 18, to: 19 });
  const r = await act(flats[0], 'book', { res: wash, date: day(6), from: 18, to: 20, every: 1, months: 12 });
  assert.equal(r.status, 200); assert.equal(r.json.result.skipped, 1);
  const mine = (await state(flats[0])).bookings.filter(b => b.series);
  assert.ok(mine.every(b => b.date <= core.addMonths(today, 4)));
  assert.ok(mine.length >= 15 && mine.length <= 18);
  assert.equal((await act(flats[0], 'cancelSeries', { series: mine[0].series })).json.result.removed, mine.length);
});

test('residents cannot use admin functions or cancel other flats', async () => {
  assert.equal((await act(flats[0], 'postSave', { title: 'x', body: 'y' })).status, 403);
  assert.equal((await act(flats[0], 'eventSave', { title: 'x', date: day(3) })).status, 403);
  assert.equal((await act(flats[0], 'userSave', { name: 'x', login: 'x', password: '123456' })).status, 403);
  const other = (await state(admin)).bookings.find(b => b.date === day(2));
  assert.equal((await act(flats[0], 'cancel', { id: other.id })).status === 200, other.by === 'Wohnung 1');
  assert.equal((await state(flats[0])).users, undefined);
});

test('an event reserves its room, clashes are refused, cancelling frees the room', async () => {
  await act(flats[2], 'book', { res: room, date: day(8), from: 10, to: 12 });
  assert.equal((await act(admin, 'eventSave', { title: 'Brunch', date: day(8), from: 9, to: 13, res: room })).status, 409);
  const ok = await act(admin, 'eventSave', { title: 'Brunch', date: day(9), from: 9, to: 13, res: room });
  assert.equal(ok.status, 200);
  assert.equal((await act(flats[2], 'book', { res: room, date: day(9), from: 12, to: 14 })).status, 409);
  assert.equal((await act(admin, 'eventSave', { id: ok.json.result.id, title: 'Brunch', date: day(9), from: 10, to: 12, res: room })).status, 200);
  await act(admin, 'eventDelete', { id: ok.json.result.id });
  assert.equal((await act(flats[2], 'book', { res: room, date: day(9), from: 12, to: 14 })).status, 200);
});

test('only rooms can be the place of an event; contact has the admin email and no WhatsApp', async () => {
  const s = await state(admin);
  const guest = s.resources.find(r => r.name === 'Gästezimmer'), bench = s.resources.find(r => r.name === 'Festbankgarnituren');
  assert.deepEqual(s.resources.filter(r => r.cat === 'wasch').map(r => r.name), ['1. Stock', '2. Stock', '3. Stock', '4. Stock']);
  assert.equal(guest.cat, 'zimmer'); assert.equal(bench.cat, 'material');
  for (const r of [guest, bench]) assert.equal((await act(admin, 'eventSave', { title: 'Fest', date: day(20), from: 10, to: 12, res: r.id })).status, 400);
  assert.equal(s.settings.email, 'hubi.weber@bluewin.ch'); assert.equal(s.settings.whatsapp, undefined);
  assert.ok(s.resources.find(r => r.name === 'Gemeinschaftsraum').img);
});

test('data saved by the older version is brought up to date', () => {
  const old = { settings: { email: '', whatsapp: 'https://x', sender: 'V' }, resources: [{ id: 'r1', cat: 'tisch' }, { id: 'r2', cat: 'anderes' }, { id: 'r3', cat: 'raum' }] };
  core.migrate(old);
  assert.deepEqual(old.resources.map(r => r.cat), ['material', 'material', 'raum']);
  assert.equal(old.settings.whatsapp, undefined);
});

test('a flat changes its password; the admin can give a new initial one', async () => {
  assert.equal((await act(flats[6], 'password', { old: 'wrong', new: 'Mein-Neues' })).status, 400);
  assert.equal((await act(flats[6], 'password', { old: 'Garten-1007', new: 'Mein-Neues' })).status, 200);
  assert.equal((await req('POST', '/api/login', { login: '1.07', password: 'Garten-1007' })).status, 401);
  await login('1.07', 'Mein-Neues');
  const u = (await state(admin)).users.find(x => x.login === '1.07');
  assert.equal(u.initial, false);
  await act(admin, 'userSave', Object.assign({}, u, { password: 'Linde-2222' }));
  assert.equal((await req('GET', '/api/state', null, flats[6])).status, 401);   // old devices are logged out after a reset
  await login('1.07', 'Linde-2222');
});

test('data survives a restart, passwords are not stored readable', async () => {
  const before = (await state(admin)).bookings.length;
  await app.close();
  const raw = fs.readFileSync(path.join(dir, 'state.json'), 'utf8');
  assert.ok(!raw.includes('Start-1234') && !raw.includes('Linde-2222'));
  app = await start({ port: 0, dataDir: dir, quiet: true }); base = 'http://127.0.0.1:' + app.port;
  assert.equal((await state(admin)).bookings.length, before);   // still logged in, same data
});
