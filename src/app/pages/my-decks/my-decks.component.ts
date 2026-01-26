import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { catchError, forkJoin, map, of } from 'rxjs';

import { CreateDeckRequest, DeckResponse } from '../../models/Deck.dto';
import { CardResponse } from '../../models/Card.dto';
import { DeckService } from '../../services/deck.service';
import { DeckFormDialogComponent } from '../../shared/deck-form-dialog/deck-form-dialog.component';
import { UI_TEXT } from '../../constants/ui-text';

@Component({
  selector: 'app-my-decks',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RouterModule, DeckFormDialogComponent],
  templateUrl: './my-decks.component.html',
  styleUrl: './my-decks.component.scss'
})
export class MyDecksComponent implements OnInit {
  readonly text = UI_TEXT;
  showCreateDialog = false;
  showNoCardsDialog = false;
  noCardsDeckId: number | null = null;
  noCardsDeckName = '';
  showDeleteDialog = false;
  pendingDeleteDeck: DeckResponse | null = null;
  deckDeleting = false;
  decks: DeckResponse[] = [];
  difficultyByDeckId: Record<number, number | null> = {};
  initialLoading = true;
  refreshing = false;
  sortOption: 'newest' | 'oldest' | 'difficulty-high' | 'difficulty-low' = 'newest';
  sortOptions = [
    { value: 'newest', label: UI_TEXT.myDecks.sortOptions.newest },
    { value: 'oldest', label: UI_TEXT.myDecks.sortOptions.oldest },
    { value: 'difficulty-high', label: UI_TEXT.myDecks.sortOptions.difficultyHigh },
    { value: 'difficulty-low', label: UI_TEXT.myDecks.sortOptions.difficultyLow }
  ] as const;

  constructor(private deckService: DeckService, private router: Router) {}

  ngOnInit(): void {
    this.loadDecks(true);
  }

  get publicDecks(): DeckResponse[] {
    return this.decks.filter((deck) => deck.isPublic);
  }

  get privateDecks(): DeckResponse[] {
    return this.decks.filter((deck) => !deck.isPublic);
  }

  get sortedPublicDecks(): DeckResponse[] {
    return this.sortDecks(this.publicDecks);
  }

  get sortedPrivateDecks(): DeckResponse[] {
    return this.sortDecks(this.privateDecks);
  }

  openCreateDialog(): void {
    this.showCreateDialog = true;
  }

  openDeck(deck: DeckResponse): void {
    if (deck.cardCount === 0) {
      this.noCardsDeckId = deck.id;
      this.noCardsDeckName = deck.name;
      this.showNoCardsDialog = true;
      return;
    }
    this.router.navigate(['/decks', deck.id, 'practice']);
  }

  openDetails(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/decks', deck.id]);
  }

  openAddCards(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/decks', deck.id], { queryParams: { addCard: '1' } });
  }

  deleteDeck(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.pendingDeleteDeck = deck;
    this.showDeleteDialog = true;
  }

  getDeckGradient(deck: DeckResponse, index: number): string {
    const avg = this.difficultyByDeckId[deck.id];
    if (avg !== undefined && avg !== null) {
      if (avg <= 1.5) {
        return 'from-emerald-500/90 to-emerald-700/90';
      }
      if (avg <= 2.5) {
        return 'from-amber-400/90 to-orange-600/90';
      }
      return 'from-rose-500/90 to-rose-700/90';
    }
    return 'from-slate-700/80 to-slate-900/80';
  }

  createOrUpdateDeck(request: CreateDeckRequest): void {
    this.deckService.createDeck(request).subscribe({
      next: () => {
        this.showCreateDialog = false;
        this.loadDecks(false);
      },
      error: (err) => {
        console.error('Create deck failed', err);
      }
    });
  }

  closeNoCardsDialog(): void {
    this.showNoCardsDialog = false;
    this.noCardsDeckId = null;
    this.noCardsDeckName = '';
  }

  goToAddCards(): void {
    if (this.noCardsDeckId) {
      this.router.navigate(['/decks', this.noCardsDeckId], { queryParams: { addCard: '1' } });
    }
    this.closeNoCardsDialog();
  }

  cancelDeleteDeck(): void {
    if (this.deckDeleting) {
      return;
    }
    this.showDeleteDialog = false;
    this.pendingDeleteDeck = null;
  }

  confirmDeleteDeck(): void {
    if (!this.pendingDeleteDeck || this.deckDeleting) {
      return;
    }
    this.deckDeleting = true;
    this.deckService.deleteDeck(this.pendingDeleteDeck.id).subscribe({
      next: () => {
        this.deckDeleting = false;
        this.showDeleteDialog = false;
        this.pendingDeleteDeck = null;
        this.loadDecks(false);
      },
      error: (err) => {
        console.error('Delete deck failed', err);
        this.deckDeleting = false;
      }
    });
  }

  private loadDecks(showLoader = true): void {
    if (showLoader) {
      this.initialLoading = true;
    } else {
      this.refreshing = true;
    }
    this.deckService.getDecks().subscribe({
      next: (decks) => {
        this.decks = decks;
        this.updateDifficultyAverages(decks);
        this.initialLoading = false;
        this.refreshing = false;
      },
      error: () => {
        this.initialLoading = false;
        this.refreshing = false;
      }
    });
  }

  private updateDifficultyAverages(decks: DeckResponse[]): void {
    if (decks.length === 0) {
      this.difficultyByDeckId = {};
      return;
    }

    forkJoin(
      decks.map((deck) =>
        this.deckService.getDeckById(deck.id).pipe(
          map((detail) => ({
            id: deck.id,
            avg: this.calculateAverageDifficulty(detail.cards ?? [])
          })),
          catchError(() => of({ id: deck.id, avg: null }))
        )
      )
    ).subscribe((results) => {
      const next: Record<number, number | null> = {};
      results.forEach((result) => {
        next[result.id] = result.avg;
      });
      this.difficultyByDeckId = next;
    });
  }

  private calculateAverageDifficulty(cards: CardResponse[]): number | null {
    const values = cards
      .map((card) => card.difficulty)
      .filter((value): value is number => typeof value === 'number');
    if (values.length === 0) {
      return null;
    }
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
  }

  private sortDecks(decks: DeckResponse[]): DeckResponse[] {
    const sorted = [...decks];
    sorted.sort((a, b) => {
      if (this.sortOption === 'newest' || this.sortOption === 'oldest') {
        const aTime = Date.parse(a.createdAt) || 0;
        const bTime = Date.parse(b.createdAt) || 0;
        return this.sortOption === 'newest' ? bTime - aTime : aTime - bTime;
      }

      const aDiff = this.difficultyByDeckId[a.id];
      const bDiff = this.difficultyByDeckId[b.id];
      if (aDiff === null || aDiff === undefined) {
        return bDiff === null || bDiff === undefined ? 0 : 1;
      }
      if (bDiff === null || bDiff === undefined) {
        return -1;
      }
      return this.sortOption === 'difficulty-high' ? bDiff - aDiff : aDiff - bDiff;
    });
    return sorted;
  }
}

