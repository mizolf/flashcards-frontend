import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { LoginUserDTO } from '../models/LoginUserDTO.dto';
import { LoginResponseDTO } from '../models/LoginResponseDTO.dto';
import { RegisterUserDTO } from '../models/RegisterUserDTO.dto';
import { VerifiedUserDTO } from '../models/VerifiedUserDTO.dto';
import { User } from '../models/User.dto';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'https://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(request: LoginUserDTO): Observable<LoginResponseDTO>{
    return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, request);
  }

  signup(registerUserDTO: RegisterUserDTO): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, registerUserDTO);
  }

  verify(verifiedUserDTO: VerifiedUserDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/verify`, verifiedUserDTO, { responseType: 'text' });
  }

  resendVerificationCode(email: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/resend`, email, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

    isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) {
      return false;
    }
    
    return Date.now() < parseInt(expiration);
  }
}
