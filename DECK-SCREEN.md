# Documentation: Decks and Cards Screens

This document explains the screens:
- **My Decks** (list, sort, create, delete, navigate to detail/practice)
- **Deck Detail** (edit deck + add/edit cards + tag filtering)
- **Deck Practice** (practice flow + filters)

It is written for beginners and focuses on where things live in the code and how the data flows.

---

## 1) My Decks (list + create)

**Path:** `src/app/pages/my-decks/`

**Main files:**
- `src/app/pages/my-decks/my-decks.component.ts`
- `src/app/pages/my-decks/my-decks.component.html`

**FRONT-IMPLEMENTATION features used:**
- **Routing:** `/my-decks` → `MyDecksComponent` (protected by `authGuard`) in `src/app/app.routes.ts`
- **Service:** `DeckService.getDecks()`, `createDeck()`, `deleteDeck()` in `src/app/services/deck.service.ts`
- **DTOs:** `CreateDeckRequest`, `DeckResponse` in `src/app/models/Deck.dto.ts`
- **Shared UI:** `DeckFormDialogComponent` in `src/app/shared/deck-form-dialog/`
- **Loading:** overlay spinner classes in `src/styles.scss`
- **PrimeNG:** `ButtonModule` (buttons)

**What the user sees:**
- Lists of **public** and **private** decks
- Sort dropdown (Newest/Oldest/Difficulty)
- Buttons to Play/Edit/Delete

**Data flow (simplified):**
1. `ngOnInit()` calls `loadDecks(true)`
2. `loadDecks()` calls the API via `DeckService.getDecks()`
3. When data arrives, it fills `this.decks`
4. UI renders the deck lists

**Creating a deck:**
- On "Save" it triggers `createOrUpdateDeck()`
- That calls `DeckService.createDeck(request)`
- On success: `loadDecks(false)` (refresh without hiding the UI)

**Deleting a deck:**
- Click **Delete** opens confirm dialog (`deleteDeck()` sets state)
- Confirm runs `confirmDeleteDeck()` → `DeckService.deleteDeck(...)`
- On success: `loadDecks(false)`

---

## 2) Deck Detail (edit deck + cards)

**Path:** `src/app/pages/deck-detail/`

**Main files:**
- `src/app/pages/deck-detail/deck-detail.component.ts`
- `src/app/pages/deck-detail/deck-detail.component.html`

**FRONT-IMPLEMENTATION features used:**
- **Routing:** `/decks/:id` → `DeckDetailComponent` (protected by `authGuard`) in `src/app/app.routes.ts`
- **Services:** `DeckService.getDeckById()` + `updateDeck()`; `CardService.createCard()`, `updateCard()`, `deleteCard()` in `src/app/services/`
- **DTOs:** `DeckDetailResponse`, `CardResponse`, `CreateCardRequest` in `src/app/models/`
- **Shared UI:** `CardFormDialogComponent` in `src/app/shared/card-form-dialog/`
- **Loading:** overlay spinner classes in `src/styles.scss`
- **PrimeNG:** `ButtonModule`, `InputTextModule`, `CheckboxModule`

**What the user sees:**
- Deck details (name, owner, card count)
- Form to edit name and public/private
- List of cards (question, answer, tag)
- **New card** button
- Tag filter pills (derived from card tags)

**Data flow (simplified):**
1. `ngOnInit()` calls `loadDeck(true)`
2. `loadDeck()` calls the API via `DeckService.getDeckById(deckId)`
3. When data arrives:
   - `this.deck` = deck
   - `this.cards` = deck.cards
   - `this.deckName` and `this.deckIsPublic`
   - Tag filters are recomputed from `deck.cards`

**Editing a deck:**
- Click **Save changes** calls `saveDeck()`
- `saveDeck()` calls `DeckService.updateDeck(...)`
- On success: `loadDeck(false)` (refresh without hiding the UI)

**Adding a card:**
- Click **New card** opens `CardFormDialogComponent`
- On save: `saveCard()` calls `CardService.createCard(...)`
- On success: `loadDeck(false)`

**Editing a card:**
- Click **Edit** on a card
- `openCardDialog(card)` sets `editingCard`
- `saveCard()` calls `CardService.updateCard(...)`
- On success: `loadDeck(false)`

**Deleting a card:**
- Click **Delete**
- `deleteCard()` calls `CardService.deleteCard(...)`
- On success: `loadDeck(false)`

---

## 3) Deck Practice (study flow)

**Path:** `src/app/pages/deck-practice/`

**Main files:**
- `src/app/pages/deck-practice/deck-practice.component.ts`
- `src/app/pages/deck-practice/deck-practice.component.html`

**FRONT-IMPLEMENTATION features used:**
- **Routing:** `/decks/:id/practice` (protected by `authGuard`) in `src/app/app.routes.ts`
- **Service:** `DeckService.getDeckById()` in `src/app/services/deck.service.ts`
- **DTOs:** `DeckDetailResponse`, `CardResponse` in `src/app/models/`
- **Loading:** overlay spinner classes in `src/styles.scss`

**What the user sees:**
- Practice view with flip card
- Random order + Shuffle controls
- Tag and difficulty filters
- Back button to return to My Decks

---

## 4) Dialogs (forms for deck and card)

**Deck dialog:**
- `src/app/shared/deck-form-dialog/`
- Inputs: `visible`, `deck` (when editing)
- Output: `save` event with `CreateDeckRequest`

**Card dialog:**
- `src/app/shared/card-form-dialog/`
- Inputs: `visible`, `card` (when editing)
- Output: `save` event with `CreateCardRequest`

These dialogs are presentational and only send data back to the parent component.

---

## 5) Loading / refresh overlay

Global overlay spinner lives in:
- `src/styles.scss`

Classes:
- `.app-loading-overlay`
- `.app-loading-spinner`

On **My Decks** and **Deck Detail** we show the overlay when:
- `initialLoading` (first load)
- `refreshing` (after save/add/delete)

This keeps the UI visible while still indicating loading.

---

## 6) Most common edit locations

**For UI changes:**
- `src/app/pages/my-decks/my-decks.component.html`
- `src/app/pages/deck-detail/deck-detail.component.html`

**For data flow changes:**
- `src/app/pages/my-decks/my-decks.component.ts`
- `src/app/pages/deck-detail/deck-detail.component.ts`

**For loader styling:**
- `src/styles.scss`

---
