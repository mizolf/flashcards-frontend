import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { LoginUserDTO } from '../models/LoginUserDTO.dto';
import { LoginResponseDTO } from '../models/LoginResponseDTO.dto';
import { RegisterUserDTO } from '../models/RegisterUserDTO.dto';
import { VerifiedUserDTO } from '../models/VerifiedUserDTO.dto';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { UserService } from './user.service';
import { User } from '../models/User.dto';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {

    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    this.checkAuthStatus();
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
  
  logout(): Observable<void> {
    this.currentUserSubject.next(null);
    return this.http.post<void>(`${this.apiUrl}/logout`, {})
  }

  checkAuthStatus(): void {
    this.userService.getAuthenticatedUser().subscribe({
      next: (user: User) => {
        this.currentUserSubject.next(user);
      },
      error: () => {
        this.currentUserSubject.next(null);
      }
    })
  }
  
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
  
  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
