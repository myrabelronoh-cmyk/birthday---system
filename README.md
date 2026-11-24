# Birthday Reminder

A React dashboard for keeping track of birthdays. Sign in, see birthdays
coming up, and save additional people to a list stored in your browser.

## Features

- Create an account and sign in with Firebase email and password.
- View birthday totals, birthdays today, upcoming birthdays, and categories.
- See each person's next birthday, countdown, and age they will turn.
- Search upcoming birthdays by name or category.
- Add birthdays with a name, date of birth, and category.
- Keep saved birthdays separate for each signed-in account in the current
  browser.
- Show sample birthdays from `src/data/mockBirthdays.js` on the dashboard.

### Data and reminders

Custom birthdays are stored in the browser's `localStorage`; they are not
uploaded to Firebase, shared between devices, or backed up to a server. Clearing
the browser's site data will remove them. Sample birthdays are included in the
dashboard alongside custom entries.

The app displays birthday dates and countdowns. It does not send push
notifications, emails, or calendar invites.

## Requirements

- Node.js 22 (the GitHub Pages workflow uses Node.js 22)
- npm
- A Firebase project with Email/Password sign-in enabled to use account
  registration and sign-in

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. With the current Vite base configuration,
the app is available at `http://localhost:5173/birthday-reminder-system/`.

## Firebase configuration

The Firebase client configuration is in `src/firebase.js`. It currently points
to the project's configured Firebase app. To use a different Firebase project:

1. Create or select a project in the [Firebase Console](https://console.firebase.google.com/).
2. Register a web app and copy its Firebase configuration into
   `src/firebase.js`.
3. In Firebase Authentication, enable the Email/Password sign-in provider.

Firebase is used for authentication only; birthday records are stored in the
browser as described above.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest test suite once |
| `npm run test:coverage` | Run tests and generate coverage reports |
| `npm run lint` | Run Oxlint |

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` builds the
app and deploys it to GitHub Pages when changes are pushed to `main`. It can
also be started manually from the repository's Actions tab. The Vite `base`
value in `vite.config.js` is currently `/birthday-reminder-system/`; update it
to match the repository path if deploying this app to a differently named
GitHub Pages project.

For Firebase Hosting, `firebase.json` is configured to serve the production
build from `dist/` and rewrite routes to `index.html`. Build the app with
`npm run build`, then deploy with the Firebase CLI after selecting the
appropriate Firebase project.

## Project layout

```text
src/
  components/       Authentication screen
  context/          Firebase authentication state and actions
  data/             Sample birthday records
  hooks/            Authentication hook
  App.jsx           Birthday dashboard and birthday management
  firebase.js       Firebase client setup
  test/             Shared test setup
.github/workflows/  GitHub Pages deployment workflow
```
