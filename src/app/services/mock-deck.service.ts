import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CreateDeckRequest, DeckDetailResponse, DeckResponse } from '../models/Deck.dto';
import {
  createDeck as createDeckInStore,
  deleteDeck as deleteDeckInStore,
  getDeckDetail,
  listDecks,
  listPublicDecks,
  updateDeck as updateDeckInStore
} from './mock-store';

@Injectable({
  providedIn: 'root'
})
export class MockDeckService {
  getDecks(): Observable<DeckResponse[]> {
    return of(listDecks());
  }

  getDeckById(id: number): Observable<DeckDetailResponse> {
    const deck = getDeckDetail(id);
    return deck ? of(deck) : throwError(() => new Error('Deck not found'));
  }

  getPublicDecks(): Observable<DeckResponse[]> {
    return of(listPublicDecks());
  }

  createDeck(request: CreateDeckRequest): Observable<DeckResponse> {
    return of(createDeckInStore(request));
  }

  updateDeck(id: number, request: CreateDeckRequest): Observable<DeckResponse> {
    const updated = updateDeckInStore(id, request);
    return updated ? of(updated) : throwError(() => new Error('Deck not found'));
  }

  deleteDeck(id: number): Observable<void> {
    const deleted = deleteDeckInStore(id);
    return deleted ? of(undefined) : throwError(() => new Error('Deck not found'));
  }
}
