import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { CreateDeckRequest, DeckResponse, DeckDetailResponse } from '../models/Deck.dto';
import { PageResponse, PaginationParams } from '../models/Page.dto';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private apiUrl = `${environment.apiUrl}/decks`;

  constructor(private http: HttpClient) {}

  private buildParams(params?: PaginationParams): HttpParams {
    let httpParams = new HttpParams();
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params?.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params?.sortDir) {
      httpParams = httpParams.set('sortDir', params.sortDir);
    }
    if (params?.sizeFilter) {
      httpParams = httpParams.set('sizeFilter', params.sizeFilter);
    }
    if (params?.minCards !== undefined && params.minCards !== null) {
      httpParams = httpParams.set('minCards', params.minCards.toString());
    }
    if (params?.isPublic !== undefined) {
      httpParams = httpParams.set('isPublic', params.isPublic.toString());
    }
    return httpParams;
  }

  getDecks(params?: PaginationParams): Observable<PageResponse<DeckResponse>> {
    return this.http.get<PageResponse<DeckResponse>>(this.apiUrl, {
      params: this.buildParams(params)
    });
  }

  getDeckById(id: number): Observable<DeckDetailResponse> {
    return this.http.get<DeckDetailResponse>(`${this.apiUrl}/${id}`);
  }

  getPublicDecks(params?: PaginationParams): Observable<PageResponse<DeckResponse>> {
    return this.http.get<PageResponse<DeckResponse>>(`${this.apiUrl}/public`, {
      params: this.buildParams(params)
    });
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
