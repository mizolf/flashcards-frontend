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

  startSession(deckId: number): Observable<QuickLearnSessionResponse> {
    return this.http.post<QuickLearnSessionResponse>(`${this.apiUrl}/${deckId}/learn/start`, {});
  }

  submitResults(deckId: number, request: SubmitQuickLearnRequest): Observable<QuickLearnResultResponse> {
    return this.http.post<QuickLearnResultResponse>(`${this.apiUrl}/${deckId}/learn/submit`, request);
  }
}
