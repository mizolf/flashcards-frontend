import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { CreateCardRequest, CardResponse } from '../models/Card.dto';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/decks`;

  constructor(private http: HttpClient) {}

  getCards(deckId: number): Observable<CardResponse[]> {
    return this.http.get<CardResponse[]>(`${this.apiUrl}/${deckId}/cards`);
  }

  getCardById(deckId: number, cardId: number): Observable<CardResponse> {
    return this.http.get<CardResponse>(`${this.apiUrl}/${deckId}/cards/${cardId}`);
  }

  createCard(deckId: number, request: CreateCardRequest): Observable<CardResponse> {
    return this.http.post<CardResponse>(`${this.apiUrl}/${deckId}/cards`, request);
  }

  updateCard(deckId: number, cardId: number, request: CreateCardRequest): Observable<CardResponse> {
    return this.http.put<CardResponse>(`${this.apiUrl}/${deckId}/cards/${cardId}`, request);
  }

  deleteCard(deckId: number, cardId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${deckId}/cards/${cardId}`);
  }
}
