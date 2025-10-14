# GetPayIn Mobile App

An Expo (React Native) application that demonstrates secure authentication, biometric re-entry, offline resilience, and product management for a storefront experience.

## Setup & Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Sync the native modules that Expo manages (run once after cloning or when dependencies change):

   ```bash
   npx expo install
   ```

3. Configure your preferred simulator or device for testing. Expo Go on iOS/Android is fine for the challenge; no native build steps are required.

4. (Optional) Clear Expo's cache if you switch branches or encounter bundler glitches:

   ```bash
   npx expo start --clear
   ```

## Running the App

Launch the Metro bundler:

```bash
npx expo start
```

- Press `a` to launch the Android emulator, `i` for the iOS simulator, or scan the QR code from Expo Go on a physical device.
- Expo Router powers navigation, so edits under `app/` hot-reload instantly.
- The project targets the Expo SDK 54 toolchain (React Native 0.81, React 19).

## Approach Highlights

- React Query handles all data fetching and cache persistence; MMKV keeps the cache hydrated for instant offline views.
- Redux Toolkit stores the authenticated session, superadmin flag, and user metadata.
- A custom idle hook auto-locks the UI after 10s of inactivity or backgrounding, and biometrics unlock the session before content is revealed.
- Shared UI elements (offline banner, toasts, theme toggle) are centralized to keep the three screens focused on the challenge scope.

## Authentication & Roles

- **Superadmin credentials (chosen user):** `emilys / emilyspass`
- Superadmin users can delete products directly from the Products screen; other users get a read-only list.
- If a valid session token exists on launch, the biometric modal appears before restoring access. A fallback to password login remains available.

## Specific Category Screen

- **Chosen category:** `smartphones`
- The screen opens pre-filtered to Smartphones so the challenge requirement is satisfied and cached data is visible offline right away.
- Category chips allow browsing other categories with the same UI, while the featured banner documents the mandated selection.

## Trade-offs & Known Limitations

- Session validation and product queries rely on `dummyjson.com`; outages or schema drift would impact the demo.
- React Query persistence is limited to successful fetches to avoid reviving pending requests after cold starts.
- Idle locking is currently tuned to 10 seconds for rapid testing, which is shorter than a production-ready timeout.

## If I Had More Time

- Add integration tests around the biometric flow and offline login fallback.
- Harden error surfaces with localized copy and retry helpers across every data screen.
- Expand product management to include optimistic creation/editing, not only deletion.
- Expand product listing further to include a product details page to view more information about each product.

