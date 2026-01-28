import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

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
  /** Static UI copy for the template. */
  readonly text = UI_TEXT;
  /** Controls the create-deck dialog visibility. */
  showCreateDialog = false;
  /** Controls the "no cards" dialog visibility. */
  showNoCardsDialog = false;
  /** Deck id used by the no-cards dialog action. */
  noCardsDeckId: number | null = null;
  /** Deck name shown in the no-cards dialog text. */
  noCardsDeckName = '';
  /** Controls the delete confirmation dialog visibility. */
  showDeleteDialog = false;
  /** Deck pending deletion in the confirm dialog. */
  pendingDeleteDeck: DeckResponse | null = null;
  /** True while delete request is in flight. */
  deckDeleting = false;
  /** Raw deck list loaded from the API. */
  decks: DeckResponse[] = [];
  /** Average difficulty per deck id for gradient styling. */
  difficultyByDeckId: Record<number, number | null> = {};
  /** True while initial page load is running. */
  initialLoading = true;
  /** True while a background refresh is running. */
  refreshing = false;
  /** Current sort selection for the deck lists. */
  sortOption: 'newest' | 'oldest' | 'difficulty-high' | 'difficulty-low' = 'newest';
  /** Select options displayed in the sort dropdown. */
  sortOptions = [
    { value: 'newest', label: UI_TEXT.myDecks.sortOptions.newest },
    { value: 'oldest', label: UI_TEXT.myDecks.sortOptions.oldest },
    { value: 'difficulty-high', label: UI_TEXT.myDecks.sortOptions.difficultyHigh },
    { value: 'difficulty-low', label: UI_TEXT.myDecks.sortOptions.difficultyLow }
  ] as const;

  /** Provides API access and routing for the deck list view. */
  constructor(private deckService: DeckService, private router: Router) {}

  /** Loads decks on first render. */
  ngOnInit(): void {
    this.loadDecks(true);
  }

  /** Public decks derived from the full list. */
  get publicDecks(): DeckResponse[] {
    return this.decks.filter((deck) => deck.isPublic);
  }

  /** Private decks derived from the full list. */
  get privateDecks(): DeckResponse[] {
    return this.decks.filter((deck) => !deck.isPublic);
  }

  /** Sorted public decks based on the current sort option. */
  get sortedPublicDecks(): DeckResponse[] {
    return this.sortDecks(this.publicDecks);
  }

  /** Sorted private decks based on the current sort option. */
  get sortedPrivateDecks(): DeckResponse[] {
    return this.sortDecks(this.privateDecks);
  }

  /** Opens the create deck dialog. */
  openCreateDialog(): void {
    this.showCreateDialog = true;
  }

  /**
   * Opens practice if the deck has cards, otherwise shows the empty dialog.
   * @param deck Deck to practice.
   */
  openDeck(deck: DeckResponse): void {
    if (deck.cardCount === 0) {
      this.noCardsDeckId = deck.id;
      this.noCardsDeckName = deck.name;
      this.showNoCardsDialog = true;
      return;
    }
    this.router.navigate(['/decks', deck.id, 'practice'], { queryParams: { origin: 'my-decks' } });
  }

  /**
   * Navigates to the deck detail view and stops card click propagation.
   * @param deck Deck to open.
   * @param event Optional click event used to stop propagation.
   */
  openDetails(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/decks', deck.id]);
  }

  /**
   * Navigates to deck detail with the add-card query param.
   * @param deck Deck to open.
   * @param event Optional click event used to stop propagation.
   */
  openAddCards(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/decks', deck.id], { queryParams: { addCard: '1' } });
  }

  /**
   * Navigates to quick learn for the selected deck.
   * @param deck Deck to learn from.
   * @param event Optional click event used to stop propagation.
   */
  openQuickLearn(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (deck.cardCount === 0) {
      this.noCardsDeckId = deck.id;
      this.noCardsDeckName = deck.name;
      this.showNoCardsDialog = true;
      return;
    }
    this.router.navigate(['/decks', deck.id, 'learn']);
  }

  /**
   * Opens the delete confirmation dialog for a deck.
   * @param deck Deck to delete.
   * @param event Optional click event used to stop propagation.
   */
  deleteDeck(deck: DeckResponse, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.pendingDeleteDeck = deck;
    this.showDeleteDialog = true;
  }

  /**
   * Returns a gradient class based on computed difficulty average.
   * @param deck Deck to style.
   * @param index Visual index (unused, kept for template signature).
   */
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

  /**
   * Creates a new deck and refreshes the list on success.
   * @param request New deck payload.
   */
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

  /** Closes the empty-deck dialog and resets its state. */
  closeNoCardsDialog(): void {
    this.showNoCardsDialog = false;
    this.noCardsDeckId = null;
    this.noCardsDeckName = '';
  }

  /** Routes to add cards for the selected deck and closes the dialog. */
  goToAddCards(): void {
    if (this.noCardsDeckId) {
      this.router.navigate(['/decks', this.noCardsDeckId], { queryParams: { addCard: '1' } });
    }
    this.closeNoCardsDialog();
  }

  /** Cancels the delete dialog if a delete is not in progress. */
  cancelDeleteDeck(): void {
    if (this.deckDeleting) {
      return;
    }
    this.showDeleteDialog = false;
    this.pendingDeleteDeck = null;
  }

  /** Confirms delete and refreshes the list on success. */
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

  /**
   * Fetches the deck list and toggles loading or refresh states.
   * @param showLoader When true, shows the initial loader instead of refresh state.
   */
  private loadDecks(showLoader = true): void {
    if (showLoader) {
      this.initialLoading = true;
    } else {
      this.refreshing = true;
    }
    this.deckService.getDecks()
      .pipe(
        switchMap((decks) => {
          this.decks = decks;
          return this.loadDifficultyAverages(decks);
        })
      )
      .subscribe({
        next: (difficultyByDeckId) => {
          this.difficultyByDeckId = difficultyByDeckId;
          this.initialLoading = false;
          this.refreshing = false;
        },
        error: () => {
          this.initialLoading = false;
          this.refreshing = false;
        }
      });
  }

  /**
   * Calculates per-deck average difficulty for gradient coloring.
   * @param decks Deck list used to fetch card details.
   */
  private updateDifficultyAverages(decks: DeckResponse[]): void {
    if (decks.length === 0) {
      return of({});
    }

    return forkJoin(
      decks.map((deck) =>
        this.deckService.getDeckById(deck.id).pipe(
          map((detail) => ({
            id: deck.id,
            avg: this.calculateAverageDifficulty(detail.cards ?? [])
          })),
          catchError(() => of({ id: deck.id, avg: null }))
        )
      )
    ).pipe(
      map((results) => {
      const next: Record<number, number | null> = {};
      results.forEach((result) => {
        next[result.id] = result.avg;
      });
      return next;
    })
    );
  }

  /**
   * Computes the average difficulty for a set of cards.
   * @param cards Cards used in the average calculation.
   */
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

  /**
   * Sorts decks by date or difficulty based on the current sort option.
   * @param decks Deck list to sort.
   */
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

