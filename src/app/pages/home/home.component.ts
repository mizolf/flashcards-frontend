import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';

import { UI_TEXT } from '../../constants/ui-text';
import { DeckResponse } from '../../models/Deck.dto';
import { PaginationParams } from '../../models/Page.dto';
import { DeckService } from '../../services/deck.service';

type SizeFilter = 'all' | 'small' | 'medium' | 'large' | 'empty';
type SortBy = 'newest' | 'oldest' | 'mostCards' | 'leastCards' | 'nameAZ' | 'nameZA';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule],
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

  /** Current page number (0-indexed). */
  currentPage = 0;
  /** Number of decks per page. */
  pageSize = 9;
  /** Total number of decks across all pages. */
  totalElements = 0;

  constructor(
    private deckService: DeckService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  loadDecks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const params: PaginationParams = {
      page: this.currentPage,
      size: this.pageSize,
      ...this.getSortParams(),
      ...this.getFilterParams()
    };

    this.deckService.getPublicDecks(params).subscribe({
      next: (decksPage) => {
        this.publicDecks = decksPage.content;
        this.totalElements = decksPage.totalElements;
        this.filteredDecks = [...this.publicDecks];
        this.applySearchFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = this.text.home.errorMessage;
        this.isLoading = false;
      }
    });
  }

  /**
   * Returns backend sort parameters based on current sort option.
   */
  private getSortParams(): Pick<PaginationParams, 'sortBy' | 'sortDir'> {
    switch (this.sortBy) {
      case 'newest':
        return { sortBy: 'createdAt', sortDir: 'desc' };
      case 'oldest':
        return { sortBy: 'createdAt', sortDir: 'asc' };
      case 'nameAZ':
        return { sortBy: 'name', sortDir: 'asc' };
      case 'nameZA':
        return { sortBy: 'name', sortDir: 'desc' };
      case 'mostCards':
        return { sortBy: 'cardCount', sortDir: 'desc' };
      case 'leastCards':
        return { sortBy: 'cardCount', sortDir: 'asc' };
      default:
        return { sortBy: 'createdAt', sortDir: 'desc' };
    }
  }

  /**
   * Returns backend filter parameters based on current filter options.
   */
  private getFilterParams(): Pick<PaginationParams, 'sizeFilter' | 'minCards'> {
    const params: Pick<PaginationParams, 'sizeFilter' | 'minCards'> = {};
    if (this.sizeFilter !== 'all') {
      params.sizeFilter = this.sizeFilter;
    }
    if (this.minCards !== null && this.minCards > 0) {
      params.minCards = this.minCards;
    }
    return params;
  }

  /**
   * Handles page change events from the paginator.
   * @param event Paginator event containing page info.
   */
  onPageChange(event: { first?: number; rows?: number; page?: number }): void {
    this.currentPage = event.page ?? 0;
    this.loadDecks();
  }

  /**
   * Handles sort option changes - resets page and reloads.
   */
  onSortChange(): void {
    this.currentPage = 0;
    this.loadDecks();
  }

  /**
   * Handles size filter changes - resets page and reloads.
   */
  onSizeFilterChange(): void {
    this.currentPage = 0;
    this.loadDecks();
  }

  /**
   * Applies client-side search filter on the deck name.
   */
  applySearchFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      this.filteredDecks = this.publicDecks.filter((deck) =>
        deck.name.toLowerCase().includes(term)
      );
    } else {
      this.filteredDecks = [...this.publicDecks];
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sizeFilter = 'all';
    this.sortBy = 'newest';
    this.minCards = null;
    this.currentPage = 0;
    this.loadDecks();
  }

  onMinCardsChange(value: number | string | null): void {
    if (value === '' || value === null) {
      this.minCards = null;
    } else {
      const normalized = Number(value);
      this.minCards = Number.isNaN(normalized) ? null : Math.max(0, normalized);
    }
    this.currentPage = 0;
    this.loadDecks();
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
