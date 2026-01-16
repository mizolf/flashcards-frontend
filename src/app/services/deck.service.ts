import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { CreateDeckRequest, DeckResponse, DeckDetailResponse } from '../models/Deck.dto';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private apiUrl = `${environment.apiUrl}/decks`;

  constructor(private http: HttpClient) {}

  getDecks(): Observable<DeckResponse[]> {
    return this.http.get<DeckResponse[]>(this.apiUrl);
  }

  getDeckById(id: number): Observable<DeckDetailResponse> {
    return this.http.get<DeckDetailResponse>(`${this.apiUrl}/${id}`);
  }

  getPublicDecks(): Observable<DeckResponse[]> {
    return this.http.get<DeckResponse[]>(`${this.apiUrl}/public`);
  }

  createDeck(request: CreateDeckRequest): Observable<DeckResponse> {
    return this.http.post<DeckResponse>(this.apiUrl, request);
  }

  updateDeck(id: number, request: CreateDeckRequest): Observable<DeckResponse> {
    return this.http.put<DeckResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteDeck(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
