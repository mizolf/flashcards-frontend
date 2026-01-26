import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CardResponse, CreateCardRequest } from '../models/Card.dto';
import {
  createCard as createCardInStore,
  deleteCard as deleteCardInStore,
  getCard,
  listCards,
  updateCard as updateCardInStore
} from './mock-store';

@Injectable({
  providedIn: 'root'
})
export class MockCardService {
  getCards(deckId: number): Observable<CardResponse[]> {
    const cards = listCards(deckId);
    return cards ? of(cards) : throwError(() => new Error('Deck not found'));
  }

  getCardById(deckId: number, cardId: number): Observable<CardResponse> {
    const card = getCard(deckId, cardId);
    return card ? of(card) : throwError(() => new Error('Card not found'));
  }

  createCard(deckId: number, request: CreateCardRequest): Observable<CardResponse> {
    const card = createCardInStore(deckId, request);
    return card ? of(card) : throwError(() => new Error('Deck not found'));
  }

  updateCard(deckId: number, cardId: number, request: CreateCardRequest): Observable<CardResponse> {
    const card = updateCardInStore(deckId, cardId, request);
    return card ? of(card) : throwError(() => new Error('Card not found'));
  }

  deleteCard(deckId: number, cardId: number): Observable<void> {
    const deleted = deleteCardInStore(deckId, cardId);
    return deleted ? of(undefined) : throwError(() => new Error('Card not found'));
  }
}
