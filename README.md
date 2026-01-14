## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Firebase (Realtime Database, no emulator)
Create a `.env.local` with your live Firebase web config. Do **not** set `NEXT_PUBLIC_USE_EMULATOR` (or set it to `false`).
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
NEXT_PUBLIC_USE_EMULATOR=false
```
The app always uses user ID `1111` for now.

### 3) Run the dev server
```bash
npm run dev
```
Then open http://localhost:3000

## Features
- Projects: add/edit/delete; fields: name, camera rules, video style notes, character.
- Scenes: add/edit/delete, drag to reorder, enable/disable.
- Generated scenes: create single or all, select via radio, delete.
- Combined scenes: combine enabled scenes + selected generated scene; delete.
- Data persists to Firebase Realtime Database under user `1111`.
