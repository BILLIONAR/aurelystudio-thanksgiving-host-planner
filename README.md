# AurelyStudio · Thanksgiving Host Planner

An undated Thanksgiving and Friendsgiving planning app with guest, menu, grocery, budget, preparation, seating, decor, and print tools. Records are saved in the current browser, and JSON backup and restore are available in the full app.

## Build

Use Node.js 22 or later.

```sh
npm ci
npm run build
```

The full site is generated in `dist/`. GitHub Actions publishes this build to GitHub Pages from the `main` branch.

The separate demo build can be generated with `npm run build:demo`. It writes to `dist-demo/`, uses a separate browser storage key, and opens with sample data. The demo has limited records and disables print and backup output. Neither edition links or redirects to the other.

## Check

```sh
TZ=America/New_York node --experimental-strip-types --test tests/*.test.mjs
npm run lint
```

The app works locally in the browser. It does not synchronize data to a cloud account.
