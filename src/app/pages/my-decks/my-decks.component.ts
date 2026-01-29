import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';

import { CreateDeckRequest, DeckResponse } from '../../models/Deck.dto';
import { PaginationParams } from '../../models/Page.dto';
import { DeckService } from '../../services/deck.service';
import { DeckFormDialogComponent } from '../../shared/deck-form-dialog/deck-form-dialog.component';
import { UI_TEXT } from '../../constants/ui-text';

@Component({
  selector: 'app-my-decks',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RouterModule, DeckFormDialogComponent, PaginatorModule],
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
  /** Current visibility filter selection. */
  visibilityFilter: 'all' | 'public' | 'private' = 'all';

  /** Returns the section title based on the current visibility filter. */
  get sectionTitle(): string {
    switch (this.visibilityFilter) {
      case 'public':
        return 'Public Decks';
      case 'private':
        return 'Private Decks';
      default:
        return 'All Decks';
    }
  }
  /** Select options for the visibility dropdown. */
  visibilityOptions = [
    { value: 'all', label: 'All' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ] as const;
  /** Current page number (0-indexed). */
  currentPage = 0;
  /** Number of decks per page. */
  pageSize = 9;
  /** Total number of decks across all pages. */
  totalElements = 0;

  /** Provides API access and routing for the deck list view. */
  constructor(private deckService: DeckService, private router: Router) {}

  /** Loads decks on first render. */
  ngOnInit(): void {
    this.loadDecks(true);
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
   * Returns a gradient class based on deck's average difficulty.
   * @param deck Deck to style.
   */
  getDeckGradient(deck: DeckResponse): string {
    const avg = deck.averageDifficulty;
    if (avg !== null) {
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
   * Handles page change events from the paginator.
   * @param event Paginator event containing page info.
   */
  onPageChange(event: { first?: number; rows?: number; page?: number }): void {
    this.currentPage = event.page ?? 0;
    this.loadDecks(false);
  }

  /**
   * Handles sort option changes and reloads decks.
   */
  onSortChange(): void {
    this.currentPage = 0;
    this.loadDecks(false);
  }

  /**
   * Handles visibility filter changes and reloads decks.
   */
  onVisibilityChange(): void {
    this.currentPage = 0;
    this.loadDecks(false);
  }

  /**
   * Returns backend sort parameters based on current sort option.
   */
  private getSortParams(): Pick<PaginationParams, 'sortBy' | 'sortDir'> {
    switch (this.sortOption) {
      case 'newest':
        return { sortBy: 'createdAt', sortDir: 'desc' };
      case 'oldest':
        return { sortBy: 'createdAt', sortDir: 'asc' };
      case 'difficulty-high':
        return { sortBy: 'averageDifficulty', sortDir: 'desc' };
      case 'difficulty-low':
        return { sortBy: 'averageDifficulty', sortDir: 'asc' };
      default:
        return { sortBy: 'createdAt', sortDir: 'desc' };
    }
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

    const params: PaginationParams = {
      page: this.currentPage,
      size: this.pageSize,
      ...this.getSortParams(),
      ...(this.visibilityFilter !== 'all' && {
        isPublic: this.visibilityFilter === 'public'
      })
    };

    this.deckService.getDecks(params).subscribe({
      next: (response) => {
        this.decks = response.content;
        this.totalElements = response.totalElements;
        this.initialLoading = false;
        this.refreshing = false;
      },
      error: () => {
        this.initialLoading = false;
        this.refreshing = false;
      }
    });
  }

}

