import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UI_TEXT } from '../../constants/ui-text';
import { DeckResponse } from '../../models/Deck.dto';
import { DeckService } from '../../services/deck.service';
import { UserService } from '../../services/user.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

type SizeFilter = 'all' | 'small' | 'medium' | 'large' | 'empty';
type SortBy = 'newest' | 'oldest' | 'mostCards' | 'leastCards' | 'nameAZ' | 'nameZA';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  /** Static UI copy for the template. */
  readonly text = UI_TEXT;
  publicDecks: DeckResponse[] = [];
  filteredDecks: DeckResponse[] = [];
  skeletons = Array.from({ length: 6 });

  searchTerm = '';
  sizeFilter: SizeFilter = 'all';
  sortBy: SortBy = 'newest';
  minCards: number | null = null;

  isLoading = false;
  errorMessage = '';

  constructor(
    private deckService: DeckService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  loadDecks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      user: this.userService.getAuthenticatedUser().pipe(catchError(() => of(null))),
      decks: this.deckService.getPublicDecks()
    })
      .pipe(
        switchMap(({ user, decks }) => {
          const username = user?.username ?? null;
          if (!username) {
            return of(decks ?? []);
          }

          const withOwner = (decks ?? []).filter((deck) => !!deck.ownerUsername);
          const withoutOwner = (decks ?? []).filter((deck) => !deck.ownerUsername);
          const filteredWithOwner = withOwner.filter((deck) => deck.ownerUsername !== username);

          if (withoutOwner.length === 0) {
            return of(filteredWithOwner);
          }

          return forkJoin(
            withoutOwner.map((deck) =>
              this.deckService.getDeckById(deck.id).pipe(
                map((detail) => ({ deck, ownerUsername: detail.ownerUsername })),
                catchError(() => of({ deck, ownerUsername: null }))
              )
            )
          ).pipe(
            map((results) => {
              const filteredWithoutOwner = results
                .filter((result) => result.ownerUsername === null || result.ownerUsername !== username)
                .map((result) => ({
                  ...result.deck,
                  ownerUsername: result.ownerUsername ?? result.deck.ownerUsername
                }));
              return [...filteredWithOwner, ...filteredWithoutOwner];
            })
          );
        })
      )
      .subscribe({
        next: (decks) => {
          this.publicDecks = decks ?? [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = this.text.home.errorMessage;
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    let decks = [...this.publicDecks];

    if (term) {
      decks = decks.filter((deck) => deck.name.toLowerCase().includes(term));
    }

    const minCards = this.minCards;
    if (minCards !== null && minCards > 0) {
      decks = decks.filter((deck) => deck.cardCount >= minCards);
    }

    switch (this.sizeFilter) {
      case 'small':
        decks = decks.filter((deck) => deck.cardCount >= 1 && deck.cardCount <= 20);
        break;
      case 'medium':
        decks = decks.filter((deck) => deck.cardCount >= 21 && deck.cardCount <= 60);
        break;
      case 'large':
        decks = decks.filter((deck) => deck.cardCount >= 61);
        break;
      case 'empty':
        decks = decks.filter((deck) => deck.cardCount === 0);
        break;
      default:
        break;
    }

    decks.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'mostCards':
          return b.cardCount - a.cardCount;
        case 'leastCards':
          return a.cardCount - b.cardCount;
        case 'nameAZ':
          return a.name.localeCompare(b.name);
        case 'nameZA':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    this.filteredDecks = decks;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sizeFilter = 'all';
    this.sortBy = 'newest';
    this.minCards = null;
    this.applyFilters();
  }

  onMinCardsChange(value: number | string | null): void {
    if (value === '' || value === null) {
      this.minCards = null;
      this.applyFilters();
      return;
    }

    const normalized = Number(value);
    this.minCards = Number.isNaN(normalized) ? null : Math.max(0, normalized);
    this.applyFilters();
  }

  sizeFilterLabel(): string {
    switch (this.sizeFilter) {
      case 'small':
        return this.text.home.sizeLabels.small;
      case 'medium':
        return this.text.home.sizeLabels.medium;
      case 'large':
        return this.text.home.sizeLabels.large;
      case 'empty':
        return this.text.home.sizeLabels.empty;
      default:
        return this.text.home.sizeLabels.all;
    }
  }

  getDeckGradient(deck: DeckResponse): string {
    if (deck.cardCount === 0) {
      return 'from-slate-700/80 to-slate-900/80';
    }
    if (deck.cardCount <= 20) {
      return 'from-emerald-500/90 to-emerald-700/90';
    }
    if (deck.cardCount <= 60) {
      return 'from-amber-400/90 to-orange-600/90';
    }
    return 'from-rose-500/90 to-rose-700/90';
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0 || this.sizeFilter !== 'all' || !!this.minCards;
  }

  play(deck: DeckResponse): void {
    if (deck.cardCount === 0) {
      return;
    }
    this.router.navigate(['/decks', deck.id, 'practice'], { queryParams: { origin: 'home' } });
  }

}
