# Flashcards Frontend - Developer Documentation

## Project Overview

Angular 18 flashcards application with PrimeNG UI components and Tailwind CSS styling.

---

## What Has Been Implemented

### 1. Project Structure

```
src/app/
├── authentication/          # Auth guard
│   └── auth.guard.ts
├── interceptors/            # HTTP interceptors
│   └── csrf.interceptor.ts
├── layout/                  # Layout components
│   ├── main-layout/         # Main wrapper (sidebar + content)
│   └── sidebar/             # Navigation sidebar
├── models/                  # DTOs/Interfaces
│   ├── Card.dto.ts
│   ├── Deck.dto.ts
│   ├── User.dto.ts
│   ├── LoginUserDTO.dto.ts
│   ├── LoginResponseDTO.dto.ts
│   ├── RegisterUserDTO.dto.ts
│   └── VerifiedUserDTO.dto.ts
├── pages/                   # Page components
│   ├── login/               # Login/Register page
│   ├── home/                # Public decks listing
│   ├── my-decks/            # User's decks listing
│   ├── deck-detail/         # Single deck with cards
│   ├── profile/             # User profile
│   └── not-found/           # 404 page
├── services/                # API services
│   ├── authentication.service.ts
│   ├── user.service.ts
│   ├── deck.service.ts
│   └── card.service.ts
├── shared/                  # Reusable components
│   ├── deck-form-dialog/    # Create/Edit deck dialog
│   └── card-form-dialog/    # Create/Edit card dialog
├── app.routes.ts            # Routing configuration
├── app.component.ts         # Root component
└── app.config.ts            # App configuration
```

---

### 2. Routing Configuration

| Route        | Component           | Description            | Protected |
| ------------ | ------------------- | ---------------------- | --------- |
| `/login`     | LoginComponent      | Login/Register form    | No        |
| `/home`      | HomeComponent       | Public decks listing   | Yes       |
| `/my-decks`  | MyDecksComponent    | User's own decks       | Yes       |
| `/decks/:id` | DeckDetailComponent | Deck detail with cards | Yes       |
| `/profile`   | ProfileComponent    | User profile           | Yes       |
| `**`         | NotFoundComponent   | 404 page               | No        |

**Note:** All routes except `/login` and `**` are protected by `authGuard`.

---

### 3. Services - Ready to Use

#### DeckService (`services/deck.service.ts`)

```typescript
// Get all user's decks
getDecks(): Observable<DeckResponse[]>

// Get single deck with cards
getDeckById(id: number): Observable<DeckDetailResponse>

// Get all public decks
getPublicDecks(): Observable<DeckResponse[]>

// Create new deck
createDeck(request: CreateDeckRequest): Observable<DeckResponse>

// Update deck
updateDeck(id: number, request: CreateDeckRequest): Observable<DeckResponse>

// Delete deck
deleteDeck(id: number): Observable<void>
```

#### CardService (`services/card.service.ts`)

```typescript
// Get all cards in a deck
getCards(deckId: number): Observable<CardResponse[]>

// Get single card
getCardById(deckId: number, cardId: number): Observable<CardResponse>

// Create new card
createCard(deckId: number, request: CreateCardRequest): Observable<CardResponse>

// Update card
updateCard(deckId: number, cardId: number, request: CreateCardRequest): Observable<CardResponse>

// Delete card
deleteCard(deckId: number, cardId: number): Observable<void>
```

---

### 4. DTOs/Models

#### Deck Models (`models/Deck.dto.ts`)

```typescript
interface CreateDeckRequest {
  name: string;
  isPublic: boolean;
}

interface DeckResponse {
  id: number;
  name: string;
  isPublic: boolean;
  createdAt: string;
  cardCount: number;
}

interface DeckDetailResponse {
  id: number;
  name: string;
  isPublic: boolean;
  createdAt: string;
  ownerUsername: string;
  cardCount: number;
  cards: CardResponse[];
}
```

#### Card Models (`models/Card.dto.ts`)

```typescript
interface CreateCardRequest {
  question: string;
  answer: string;
  tag?: string;
  difficulty?: number;
}

interface CardResponse {
  id: number;
  question: string;
  answer: string;
  tag?: string;
  difficulty?: number;
}
```

---

### 5. Layout Components - Implemented

#### MainLayoutComponent (`layout/main-layout/`)

- Wrapper component containing sidebar and main content area
- Uses `<router-outlet>` for child routes

#### SidebarComponent (`layout/sidebar/`)

- Navigation links: Home, My Decks, Profile
- Logout button with `logout()` method
- Uses PrimeNG Button and Angular RouterLink

---

## What UI Developer Needs to Implement

### 1. HomeComponent (`pages/home/`)

**Purpose:** Display all public decks

**Required UI:**

- Grid/List of public deck cards
- "Create New Deck" button
- Click on deck -> navigate to `/decks/:id`

**Connect with:**

```typescript
constructor(private deckService: DeckService, private router: Router) {}

ngOnInit() {
  this.deckService.getPublicDecks().subscribe(decks => {
    this.publicDecks = decks;
  });
}

viewDeck(deck: DeckResponse) {
  this.router.navigate(['/decks', deck.id]);
}

openCreateDialog() {
  // Show DeckFormDialogComponent
}
```

---

### 2. MyDecksComponent (`pages/my-decks/`)

**Purpose:** Display user's own decks with CRUD actions

**Required UI:**

- Grid/List of user's deck cards
- "Create New Deck" button
- Edit/Delete buttons per deck
- Click on deck -> navigate to `/decks/:id`

**Connect with:**

```typescript
constructor(private deckService: DeckService, private router: Router) {}

ngOnInit() {
  this.deckService.getDecks().subscribe(decks => {
    this.myDecks = decks;
  });
}

createDeck(data: CreateDeckRequest) {
  this.deckService.createDeck(data).subscribe(newDeck => {
    this.myDecks.push(newDeck);
  });
}

editDeck(deck: DeckResponse) {
  // Open DeckFormDialogComponent with deck data
}

deleteDeck(deck: DeckResponse) {
  this.deckService.deleteDeck(deck.id).subscribe(() => {
    this.myDecks = this.myDecks.filter(d => d.id !== deck.id);
  });
}
```

---

### 3. DeckDetailComponent (`pages/deck-detail/`)

**Purpose:** Display single deck with all its cards

**Required UI:**

- Deck info (name, owner, card count, public/private badge)
- List of cards (question/answer)
- "Add Card" button
- Edit/Delete buttons per card
- Back button to return to list

**Connect with:**

```typescript
constructor(
  private route: ActivatedRoute,
  private deckService: DeckService,
  private cardService: CardService,
  private router: Router
) {}

ngOnInit() {
  const deckId = +this.route.snapshot.paramMap.get('id')!;
  this.deckService.getDeckById(deckId).subscribe(deck => {
    this.deck = deck;
    this.cards = deck.cards;
  });
}

addCard(data: CreateCardRequest) {
  this.cardService.createCard(this.deck.id, data).subscribe(newCard => {
    this.cards.push(newCard);
  });
}

editCard(card: CardResponse) {
  // Open CardFormDialogComponent with card data
}

updateCard(cardId: number, data: CreateCardRequest) {
  this.cardService.updateCard(this.deck.id, cardId, data).subscribe(updated => {
    const index = this.cards.findIndex(c => c.id === cardId);
    this.cards[index] = updated;
  });
}

deleteCard(card: CardResponse) {
  this.cardService.deleteCard(this.deck.id, card.id).subscribe(() => {
    this.cards = this.cards.filter(c => c.id !== card.id);
  });
}
```

---

### 4. ProfileComponent (`pages/profile/`)

**Purpose:** Display user profile information

**Required UI:**

- User info (username, email)
- Optional: Change password form (if API supports)

**Connect with:**

```typescript
constructor(private authService: AuthenticationService) {}

ngOnInit() {
  this.authService.currentUser.subscribe(user => {
    this.user = user;
  });
}
```

---

### 5. NotFoundComponent (`pages/not-found/`)

**Purpose:** 404 error page

**Required UI:**

- "Page Not Found" message
- Button to navigate back to home

**Connect with:**

```typescript
constructor(private router: Router) {}

goHome() {
  this.router.navigate(['/home']);
}
```

---

### 6. DeckFormDialogComponent (`shared/deck-form-dialog/`)

**Purpose:** Dialog for creating/editing decks

**Required UI:**

- PrimeNG Dialog
- Form fields: name (input), isPublic (checkbox)
- Save/Cancel buttons

**Props/Inputs:**

```typescript
@Input() visible: boolean = false;
@Input() deck: DeckResponse | null = null;  // null = create mode, object = edit mode
@Output() visibleChange = new EventEmitter<boolean>();
@Output() save = new EventEmitter<CreateDeckRequest>();
```

---

### 7. CardFormDialogComponent (`shared/card-form-dialog/`)

**Purpose:** Dialog for creating/editing cards

**Required UI:**

- PrimeNG Dialog
- Form fields: question (textarea), answer (textarea), tag (input, optional), difficulty (number, optional)
- Save/Cancel buttons

**Props/Inputs:**

```typescript
@Input() visible: boolean = false;
@Input() card: CardResponse | null = null;  // null = create mode, object = edit mode
@Output() visibleChange = new EventEmitter<boolean>();
@Output() save = new EventEmitter<CreateCardRequest>();
```

---

## PrimeNG Components to Use

| Component       | Import                  | Usage                  |
| --------------- | ----------------------- | ---------------------- |
| Button          | `ButtonModule`          | All buttons            |
| Card            | `CardModule`            | Deck/Card display      |
| Dialog          | `DialogModule`          | Form dialogs           |
| InputText       | `InputTextModule`       | Text inputs            |
| InputTextarea   | `InputTextareaModule`   | Question/Answer fields |
| Checkbox        | `CheckboxModule`        | isPublic toggle        |
| InputNumber     | `InputNumberModule`     | Difficulty field       |
| ConfirmDialog   | `ConfirmDialogModule`   | Delete confirmations   |
| Toast           | `ToastModule`           | Success/Error messages |
| DataView        | `DataViewModule`        | Deck/Card lists        |
| ProgressSpinner | `ProgressSpinnerModule` | Loading states         |

---

## Important Notes

1. **All HTTP requests include credentials** - CSRF interceptor handles this automatically
2. **Authentication state** - Use `AuthenticationService.currentUser` observable
3. **Route parameters** - Use `ActivatedRoute.snapshot.paramMap.get('id')` for deck ID
4. **Error handling** - Add error callbacks to all subscribe() calls
5. **Loading states** - Show spinner while data is loading

---

## No Additional Routes Needed

All necessary routes are already configured. The UI developer only needs to:

1. Build the UI templates (HTML)
2. Connect UI components with the provided services
3. Handle loading/error states
