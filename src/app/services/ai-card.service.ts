import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GenerateCardsResponse, GeneratedCardDTO, SaveCardsResponse } from '../models/AiCard.dto';

@Injectable({
  providedIn: 'root'
})
export class AiCardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateFromText(deckId: number, content: string): Observable<GenerateCardsResponse> {
    return this.http.post<GenerateCardsResponse>(
      `${this.apiUrl}/decks/${deckId}/ai-cards/generate`,{ content });
  }

  generateFromPdf(deckId: number, file: File): Observable<GenerateCardsResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<GenerateCardsResponse>(
      `${this.apiUrl}/decks/${deckId}/ai-cards/generate-from-pdf`,formData);
  }

  saveGeneratedCards(deckId: number, cards: GeneratedCardDTO[]): Observable<SaveCardsResponse> {
    return this.http.post<SaveCardsResponse>(
      `${this.apiUrl}/decks/${deckId}/ai-cards/save`,{ cards });
  }
}
