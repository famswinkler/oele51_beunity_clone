# Oele51 Hausverein app

A simple residents' app for Oele51: reservations for rooms and tables, washing machine per floor, events and an info board. Made to be easy for senior residents.

- Plan and decisions: [docs/PLAN.md](docs/PLAN.md)

## Run it

Needs Node.js 20 or newer. Nothing to install.

```
node server.js
```

Then open http://localhost:3000. On the first start the server creates the admin account and prints its password (also saved in `data/erstes-passwort.txt`).

Settings, as environment variables:

| Name | Meaning | Default |
|---|---|---|
| `PORT` | Port to listen on | 3000 |
| `DATA_DIR` | Folder for the data file and backups | `./data` |
| `TZ_NAME` | Time zone of the house | `Europe/Zurich` |

For real use, put it behind HTTPS (the hosting provider or a reverse proxy does this) and keep the `data` folder: it holds everything.

## Files

| Path | What it is |
|---|---|
| `server.js` | The server: login, saving, live updates |
| `public/core.js` | All rules and checks. Used by the server and by the demo |
| `public/app.js`, `public/styles.css`, `public/index.html` | The app in the browser |
| `test/app.test.js` | Tests against a real server. Run with `npm test` |
| `prototype/index.html` | Demo in one file with example data. Rebuild with `npm run build-demo` after changing files in `public/` |
