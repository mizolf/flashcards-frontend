# Documentation: My Profile Screen

This document explains the **My Profile** screen and how it maps to the implemented frontend features.

---

## 1) My Profile (account overview)

**Path:** `src/app/pages/profile/`

**Main files:**
- `src/app/pages/profile/profile.component.ts`
- `src/app/pages/profile/profile.component.html`

**FRONT-IMPLEMENTATION features used:**
- **Routing:** `/profile` → `ProfileComponent` (protected by `authGuard`) in `src/app/app.routes.ts`
- **Auth state:** `AuthenticationService.currentUser` in `src/app/services/authentication.service.ts`
- **Auth check:** `AuthenticationService.checkAuthStatus()` (calls `UserService.getAuthenticatedUser()` under the hood)
- **Services:** `UserService.getAuthenticatedUser()` and `DeckService.getDecks()` in `src/app/services/`
- **DTOs:** `User` (`src/app/models/User.dto.ts`), `DeckResponse` (`src/app/models/Deck.dto.ts`)
- **Loading:** overlay spinner classes in `src/styles.scss`
- **PrimeNG:** uses PrimeIcons in the template (check icon)

**What the user sees:**
- Account header (Account → My Profile)
- Profile details card with:
  - Username
  - Email
  - Status (Verified with green check / Pending verification)
  - User ID
  - Decks created
  - Total cards (sum across all decks)
- Active badge (green)
- Loading overlay while data is fetched

---

## 2) Data flow (simplified)

1. `ngOnInit()` calls `AuthenticationService.checkAuthStatus()`
2. `checkAuthStatus()` calls `UserService.getAuthenticatedUser()` and updates `currentUser`
3. In parallel, `DeckService.getDecks()` fetches all user decks
4. On success:
   - `user$` is populated from `AuthenticationService.currentUser`
   - `deckCount` = number of decks
   - `cardCount` = sum of `deck.cardCount`

---

## 3) Logged-out state

If authentication fails (`checkAuthStatus()` returns false), the UI shows:
- "No authenticated user found. Please log in again."

---

## 4) Most common edit locations

**UI changes:**
- `src/app/pages/profile/profile.component.html`

**Data flow changes:**
- `src/app/pages/profile/profile.component.ts`
- `src/app/services/authentication.service.ts`
- `src/app/services/user.service.ts`
- `src/app/services/deck.service.ts`

**Loader styling:**
- `src/styles.scss`

