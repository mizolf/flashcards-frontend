import { CardResponse } from "./Card.dto";

export interface GenerateFromTextRequest {
  content: string;
}

export interface SaveGeneratedCardsRequest {
  cards: GeneratedCardDTO[];
}

export interface GenerateCardsResponse {
  cards: GeneratedCardDTO[];
  totalGenerated: number;
}

export interface SaveCardsResponse {
  savedCards: CardResponse[];
  totalSaved: number;
}

export interface GeneratedCardDTO {
  question: string;
  answer: string;
  tag: string | null;
  difficulty: number;
}

export interface SelectableGeneratedCard extends GeneratedCardDTO {
  selected: boolean;
}