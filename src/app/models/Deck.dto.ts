import { CardResponse } from './Card.dto';

export interface CreateDeckRequest {
  name: string;
  isPublic: boolean;
}

export interface DeckResponse {
  id: number;
  name: string;
  isPublic: boolean;
  createdAt: string;
  cardCount: number;
}

export interface DeckDetailResponse {
  id: number;
  name: string;
  isPublic: boolean;
  createdAt: string;
  ownerUsername: string;
  cardCount: number;
  cards: CardResponse[];  
}
