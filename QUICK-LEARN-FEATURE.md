# Quick Learn Feature - API Documentation

## Base URL

```
/api/decks/{deckId}/learn
```

---

## Endpoints

### 1. Start Session

**POST** `/api/decks/{deckId}/learn/start`

Starts a new quick learn session with random cards from the deck.

#### Response

```typescript
interface QuickLearnSessionResponse {
  deckId: number;
  deckName: string;
  totalCardsInDeck: number;
  cards: QuickLearnCardResponse[];
}

interface QuickLearnCardResponse {
  cardId: number;
  question: string;
  answer: string;
}
```

---

### 2. Submit Results

**POST** `/api/decks/{deckId}/learn/submit`

Submit answers for all cards in the session.

#### Request

```typescript
interface SubmitQuickLearnRequest {
  answers: CardAnswerRequest[];
}

interface CardAnswerRequest {
  cardId: number;
  correct: boolean;
}
```

#### Response

```typescript
interface QuickLearnResultResponse {
  sessionStats: SessionStatsResponse;
  deckStats: DeckStatsResponse;
}

interface SessionStatsResponse {
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;        // 0.0 - 1.0
}

interface DeckStatsResponse {
  totalCardsInDeck: number;
  cardsStudied: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number; // 0.0 - 1.0
}
```

---

## Example Flow

1. **Start session:** `POST /api/decks/1/learn/start`
2. **Show cards to user** (question → reveal answer → mark correct/incorrect)
3. **Submit results:** `POST /api/decks/1/learn/submit`

```json
{
  "answers": [
    { "cardId": 1, "correct": true },
    { "cardId": 2, "correct": false }
  ]
}
```

4. **Display statistics** from response
