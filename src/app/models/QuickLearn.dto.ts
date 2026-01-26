export interface QuickLearnSessionResponse {
  deckId: number;
  deckName: string;
  totalCardsInDeck: number;
  cards: QuickLearnCardResponse[];
}

export interface QuickLearnCardResponse {
  cardId: number;
  question: string;
  answer: string;
}

export interface SubmitQuickLearnRequest {
  answers: CardAnswerRequest[];
}

export interface CardAnswerRequest {
  cardId: number;
  correct: boolean;
}

export interface QuickLearnResultResponse {
  sessionStats: SessionStatsResponse;
  deckStats: DeckStatsResponse;
}

export interface SessionStatsResponse {
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
}

export interface DeckStatsResponse {
  totalCardsInDeck: number;
  cardsStudied: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
}
