import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { forkJoin } from 'rxjs';

import { AuthenticationService } from '../../services/authentication.service';
import { DeckService } from '../../services/deck.service';
import { User } from '../../models/User.dto';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  loading = true;
  isAuthenticated = true;
  deckCount = 0;
  cardCount = 0;

  constructor(
    private authService: AuthenticationService,
    private deckService: DeckService
  ) {
    this.user$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      isAuthenticated: this.authService.checkAuthStatus(),
      decksPage: this.deckService.getDecks({ page: 0, size: 1000 })
    }).subscribe({
      next: ({ isAuthenticated, decksPage }) => {
        this.isAuthenticated = isAuthenticated;
        this.deckCount = decksPage.totalElements;
        this.cardCount = decksPage.content.reduce((total, deck) => total + deck.cardCount, 0);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
