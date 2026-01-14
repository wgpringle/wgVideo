## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Firebase (Realtime Database + Auth)
Create a `.env.local` with your Firebase web config. Leave the values below as-is until you replace them with your own project settings.
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
NEXT_PUBLIC_USE_EMULATOR=false
```

Optional: to use local emulators set `NEXT_PUBLIC_USE_EMULATOR=true` (expects Realtime Database on port 9000 and Auth on port 9099).

### 3) Run the dev server
```bash
npm run dev
```
Then open http://localhost:3000

## Features
- Google sign-in (Firebase Auth), dedicated `/login` page.
- Projects: add/edit/delete; fields: name, camera rules, video style notes, character.
- Scenes: add/edit/delete, drag to reorder, enable/disable.
- Generated scenes: create single or all, select via radio, delete.
- Combined scenes: combine enabled scenes + selected generated scene; delete.
- Data persists to Firebase Realtime Database under the signed-in user.
