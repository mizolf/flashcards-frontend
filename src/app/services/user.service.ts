import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { User } from '../models/User.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  getAuthenticatedUser(): Observable<User>{
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
}
