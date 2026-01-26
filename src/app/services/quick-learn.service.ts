import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import {
  QuickLearnResultResponse,
  QuickLearnSessionResponse,
  SubmitQuickLearnRequest
} from '../models/QuickLearn.dto';

@Injectable({
  providedIn: 'root'
})
export class QuickLearnService {
  private apiUrl = `${environment.apiUrl}/decks`;

  constructor(private http: HttpClient) {}

  /**
   * Starts a new quick learn session for a deck.
   * @param deckId Deck identifier.
   */
  startSession(deckId: number): Observable<QuickLearnSessionResponse> {
    return this.http.post<QuickLearnSessionResponse>(`${this.apiUrl}/${deckId}/learn/start`, {});
  }

  /**
   * Submits quick learn answers and returns session/deck stats.
   * @param deckId Deck identifier.
   * @param request Answers payload.
   */
  submitResults(deckId: number, request: SubmitQuickLearnRequest): Observable<QuickLearnResultResponse> {
    return this.http.post<QuickLearnResultResponse>(`${this.apiUrl}/${deckId}/learn/submit`, request);
  }
}
