
## B Mate Student Services App

B Mate is an Expo Router app for student services such as food, laundry, water, cart, payments, and profile management.

## Tech Stack

- Expo + React Native
- TypeScript
- Expo Router
- Supabase Auth and PostgreSQL
- AsyncStorage for auth persistence

## Features

- Email/password authentication
- Google, GitHub, and Apple sign-in and linking
- Profile details saved to Supabase
- Date of birth picker and country code selector
- Food, laundry, and water service flows
- Cart and payment screen
- Android and web support

## Project Structure

```text
app/          Expo Router screens and layouts
components/   Reusable UI components
hooks/        App hooks such as auth
lib/          Supabase client and constants
services/     API and domain services
types/        Shared TypeScript types
supabase/     Database schema and SQL migrations
assets/       Icons, images, and static assets
```

## Prerequisites

- Node.js 18 or newer
- npm
- Expo CLI or EAS CLI
- A Supabase project

## Install

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run the SQL in [supabase/schema.sql](supabase/schema.sql).
4. In Authentication, enable the providers you need.
5. In Authentication -> URL Configuration, add these redirect URLs:
	- `bmate://auth`
	- `bmate://profile`

Suggested GitHub OAuth callback URL:

```text
https://xnqipdveuokaphmvpore.supabase.co/auth/v1/callback
```

## Run Locally

Start the Expo dev server:

```bash
npm run start
```

Run on web:

```bash
npm run web
```

Run on Android with a local device or emulator:

```bash
npm run android
```

## Build an Android Installable APK

This project includes an [eas.json](eas.json) preview profile configured to build an APK.

```bash
npx eas login
npx eas build -p android --profile preview --clear-cache
```

The preview profile produces an installable APK that you can download and sideload on your phone.

## Scripts

- `npm run start` - start Expo in development mode
- `npm run web` - start Expo Web
- `npm run android` - build and run Android locally
- `npm run typecheck` - run TypeScript checks

## Notes

- Session state is stored with Supabase and AsyncStorage.
- Profile updates are saved to the `users` table.
- OAuth linking uses deep-link callbacks for mobile.

## License

No license has been added yet.
  